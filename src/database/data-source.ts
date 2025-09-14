import { DataSource } from 'typeorm';
import config from '../config';
import path from 'path';
import logger from '../utils/logger';
// Import all entity classes directly
import { User } from '../models/User';
import { Venue } from '../models/Venue';
import { Event } from '../models/Event';
import { Booking } from '../models/Booking';
import { Seat } from '../models/Seat';
import { BookedSeat } from '../models/BookedSeat';
import { WaitlistEntry } from '../models/WaitlistEntry';

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: config.database.host,
  port: config.database.port,
  username: config.database.username,
  password: config.database.password,
  database: config.database.database,
  synchronize: false, // Always false in production to avoid data loss
  logging: config.env === 'development',
  // Directly reference entity classes instead of using path
  entities: [User, Venue, Event, Booking, Seat, BookedSeat, WaitlistEntry],
  migrations: [path.join(__dirname, 'migrations', '*.{js,ts}')],
  subscribers: [],
  // Connection pool settings for better performance
  poolSize: 10,
  connectTimeout: 20000,
});

// Initialize method for reuse
export const initializeDataSource = async (): Promise<DataSource> => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
      logger.info('Data source has been initialized');
    }
    return AppDataSource;
  } catch (error) {
    logger.error('Error during data source initialization:', error);
    throw error;
  }
};
