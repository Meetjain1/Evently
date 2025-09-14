import logger from '../utils/logger';

/**
 * Empty function for compatibility - do not use on Render
 * The original port check function used lsof which is not available in Render environment
 */
export const ensurePort3000IsAvailable = (): void => {
  // Do nothing in Render environment
  if (process.env.RENDER) {
    logger.info('Skipping port check in Render environment');
    return;
  }
  
  // Only log in development
  logger.info('Port check functionality disabled for compatibility');
};
