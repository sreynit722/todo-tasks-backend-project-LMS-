import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { TasksController } from './tasks/tasks.controller.js';
import { TasksService } from './tasks/tasks.service.js';
import { Task } from './tasks/task.entity.js';
import { User } from './users/user.entity.js';
import { AuthController } from './auth/auth.controller.js';
import { AuthService } from './auth/auth.service.js';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TaskNotificationsListener } from './tasks/task-notifications.listener.js';
import { TaskStatsListener } from './tasks/task-stats.listener.js';
import { BullModule } from '@nestjs/bullmq';
import { TasksProcessor } from './tasks/tasks.processor.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: Number(config.get<string>('DB_PORT')),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        autoLoadEntities: true,
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([Task, User]),
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
    // add Redis configuration for BullMQ
    EventEmitterModule.forRoot(),
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('REDIS_HOST'),
          port: Number(config.get<string>('REDIS_PORT')),
        },
      }),
    }),
    BullModule.registerQueue({ name: 'tasks' }),
  ],
  controllers: [AppController, TasksController, AuthController],
  providers: [
    AppService,
    TasksService,
    AuthService,
    TaskNotificationsListener,
    TaskStatsListener,
    TasksProcessor,
  ],
})
export class AppModule {}
