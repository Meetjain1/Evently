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
  url: process.env.NODE_ENV === 'production' 
    ? process.env.DATABASE_URL || 'postgresql://evently_db_iszt_user:qMhHbWnCIDNsb1iFBVPM5uQGq20llQcX@dpg-d33frdgdl3ps738rr4dg-a.singapore-postgres.render.com/evently_db_iszt'
    : process.env.DATABASE_URL, // Use external URL in production for better reliability
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
  maxQueryExecutionTime: 10000, // 10 seconds,
  // Add connection pool settings
  extra: {
    max: 20, // Maximum number of connections in the pool
    connectionTimeoutMillis: 30000, // 30 seconds to timeout connection
    idleTimeoutMillis: 600000 // 10 minutes idle timeout
  }
});

export default AppDataSource;
