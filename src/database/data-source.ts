import { DataSource } from 'typeorm';
import config from '../config';
import path from 'path';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false, // Set to false in production to avoid data loss
  logging: config.env === 'development',
  entities: [path.join(__dirname, '..', 'models', '*.{js,ts}')],
  migrations: [path.join(__dirname, 'migrations', '*.{js,ts}')],
  subscribers: [],
  // Connection pool settings for better performance
  poolSize: 10,
  connectTimeout: 20000,
  ssl: config.env === 'production' ? { rejectUnauthorized: true } : false,
});
