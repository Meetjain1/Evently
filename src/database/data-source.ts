import { DataSource } from 'typeorm';
import config from '../config';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // For Render PostgreSQL
  host: process.env.DATABASE_URL ? undefined : config.database.host,
  port: process.env.DATABASE_URL ? undefined : config.database.port,
  username: process.env.DATABASE_URL ? undefined : config.database.username,
  password: process.env.DATABASE_URL ? undefined : config.database.password,
  database: process.env.DATABASE_URL ? undefined : config.database.database,
  synchronize: true, // Enable sync to create tables initially
  logging: process.env.NODE_ENV === 'production' ? ['error', 'warn', 'migration'] : true,
  entities: [path.join(__dirname, '..', 'models', '*.{js,ts}')],
  migrations: [path.join(__dirname, 'migrations', '*.{js,ts}')],
  subscribers: [],
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
