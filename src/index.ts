import 'reflect-metadata';
import App from './app';
import logger from './utils/logger';

async function startServer() {
  try {
    const app = new App();
    await app.connectToDatabase();
    app.listen();
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
