import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
  apiPrefix: process.env.API_PREFIX || '/api',
  
  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },
  
  // Database Configuration
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'evently_db',
  },
  
  // Rate Limiter Configuration
  rateLimit: {
    windowMs: eval(process.env.RATE_LIMIT_WINDOW_MS || '15 * 60 * 1000'), // 15 minutes by default
    max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per windowMs by default
  },
  
  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
  },
};

export default config;
