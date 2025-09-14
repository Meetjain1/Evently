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
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  entities: [User, Event, Booking, Venue, Seat, BookedSeat, WaitlistEntry],
  migrations: [path.join(__dirname, '../database/migrations/*.{js,ts}')],
  synchronize: config.env === 'development',
  logging: config.env === 'development',
  poolSize: 10, 
  connectTimeout: 20000,
});

export default AppDataSource;
