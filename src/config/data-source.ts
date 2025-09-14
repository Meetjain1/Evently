import { DataSource } from 'typeorm';
import config from '../config';
import path from 'path';
import { User } from '../models/User';
import { Event } from '../models/Event';
import { Booking } from '../models/Booking';
import { Venue } from '../models/Venue';
import { Seat } from '../models/Seat';
import { BookedSeat } from '../models/BookedSeat';
import { WaitlistEntry } from '../models/WaitlistEntry';

// Create a new DataSource (TypeORM 0.3.x)
export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL, // For Render PostgreSQL
  host: process.env.DATABASE_URL ? undefined : config.database.host,
  port: process.env.DATABASE_URL ? undefined : config.database.port,
  username: process.env.DATABASE_URL ? undefined : config.database.username,
  password: process.env.DATABASE_URL ? undefined : config.database.password,
  database: process.env.DATABASE_URL ? undefined : config.database.database,
  entities: [User, Event, Booking, Venue, Seat, BookedSeat, WaitlistEntry],
  migrations: [path.join(__dirname, '../database/migrations/*.{js,ts}')],
  synchronize: process.env.NODE_ENV === 'production' ? false : true, // Only sync in dev
  logging: process.env.NODE_ENV === 'production' ? false : true,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  // Add connection retry options
  connectTimeoutMS: 30000, // 30 seconds
  maxQueryExecutionTime: 10000, // 10 seconds
});

export default AppDataSource;
