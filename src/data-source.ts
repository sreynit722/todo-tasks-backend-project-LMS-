import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Task } from './tasks/task.entity.js';
import { User } from './users/user.entity.js';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Task, User],
  migrations: ['src/migrations/*.ts'],
});
