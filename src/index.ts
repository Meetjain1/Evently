import 'reflect-metadata';
import App from './app';
import logger from './utils/logger';

async function startServer() {
  try {
    // Log environment information
    logger.info(`Starting server in ${process.env.NODE_ENV || 'development'} mode`);
    logger.info(`Database URL configured: ${process.env.DATABASE_URL ? 'Yes' : 'No'}`);
    
    const app = new App();
    
    // Try to connect to database
    try {
      await app.connectToDatabase();
    } catch (dbError) {
      logger.error('Failed to connect to database:', dbError);
      
      // In production, exit if DB connection fails
      if (process.env.NODE_ENV === 'production' && !process.env.SKIP_DB_CONNECTION) {
        logger.error('Exiting due to database connection failure');
        process.exit(1);
      }
      
      // In development, continue without DB
      logger.warn('Continuing without database in development mode');
    }
    
    // Start the server
    app.listen();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
