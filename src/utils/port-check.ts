import logger from '../utils/logger';
import { execSync } from 'child_process';

/**
 * Checks if port 3000 is in use and attempts to free it if needed
 */
export const ensurePort3000IsAvailable = (): void => {
  try {
    logger.info('Checking if port 3000 is available...');
    
    // Check what process is using port 3000 (if any)
    try {
      const output = execSync('lsof -i :3000 -t').toString().trim();
      
      if (output) {
        const pids = output.split('\n');
        logger.warn(`Port 3000 is in use by process(es): ${pids.join(', ')}`);
        
        // Attempt to kill each process
        pids.forEach((pid) => {
          try {
            logger.info(`Attempting to terminate process ${pid}...`);
            execSync(`kill -9 ${pid}`);
            logger.info(`Successfully terminated process ${pid}`);
          } catch (killError) {
            logger.error(`Failed to terminate process ${pid}:`, killError);
            throw new Error(`Could not free port 3000 (process ${pid}). Please manually stop any services using port 3000.`);
          }
        });
        
        // Verify port is now free
        try {
          execSync('lsof -i :3000 -t');
          throw new Error('Port 3000 is still in use after termination attempts');
        } catch (verifyError: any) {
          // This is expected - if the command fails, it means no process is using the port
          if (verifyError.status === 1) {
            logger.info('Port 3000 is now available');
          } else {
            throw verifyError;
          }
        }
      } else {
        logger.info('Port 3000 is available');
      }
    } catch (lsofError: any) {
      // If lsof command fails with status 1, it means no process is using the port
      if (lsofError.status === 1) {
        logger.info('Port 3000 is available');
      } else {
        throw lsofError;
      }
    }
  } catch (error) {
    logger.error('Error checking port availability:', error);
    // Don't throw here - we want the server to attempt to start anyway
  }
};
