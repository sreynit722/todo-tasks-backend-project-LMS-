import { NestFactory, Reflector } from '@nestjs/core';
import {
  ClassSerializerInterceptor,
  LogLevel,
  ValidationPipe,
} from '@nestjs/common';
import { AppModule } from './app.module.js';
import { LoggingInterceptor } from './common/logging.interceptor.js';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevels: LogLevel[] = isProduction
    ? ['log', 'warn', 'error']
    : ['log', 'warn', 'error', 'debug'];

  const app = await NestFactory.create(AppModule, { logger: logLevels });

  app.useGlobalPipes(new ValidationPipe({whitelist: true}));
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ClassSerializerInterceptor(app.get(Reflector)),
  );

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
