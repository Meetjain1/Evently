import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

// Error handling middleware
export const errorHandler = (
  err: Error, 
  req: Request, 
  res: Response, 
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
) => {
  logger.error(`Error occurred at ${req.method} ${req.path}`);
  logger.error(`Error name: ${err.name}`);
  logger.error(`Error message: ${err.message}`);
  logger.error(`Error stack: ${err.stack || ''}`);

  // Check error type and respond accordingly
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Unauthorized access' });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({ message: 'Forbidden access' });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({ message: err.message || 'Resource not found' });
  }

  if (err.name === 'ConflictError') {
    return res.status(409).json({ message: err.message });
  }

  // Handle database connection errors
  if (err.message.includes('database') || err.message.includes('connection')) {
    return res.status(503).json({ 
      message: 'Service temporarily unavailable - database error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Default to 500 server error
  return res.status(500).json({ 
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
