import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import config from './config';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { apiRateLimiter } from './middlewares/rate-limiter.middleware';
import logger from './utils/logger';
import { AppDataSource } from './config/data-source';
// Remove dependency on port check
// import { ensurePort3000IsAvailable } from './utils/port-check';

class App {
  public app: Express;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeSwagger();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares() {
    // CORS must be enabled before other middleware
    this.app.use(cors({
      origin: true, // Reflect the request origin
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
    }));
    
    // Add preflight handling for all routes
    this.app.options('*', cors());
    
    // Configure helmet with relaxed settings for development
    this.app.use(helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
      contentSecurityPolicy: false,
      crossOriginEmbedderPolicy: false
    }));
    
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
    this.app.use(apiRateLimiter);
  }

  private initializeRoutes() {
    // Middleware to handle preflight requests and set CORS headers
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS, PATCH');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');
      
      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        return res.status(200).send();
      }
      
      next();
    });
    
    this.app.use(config.apiPrefix, routes);
    
    // Health check endpoint
    this.app.get('/health', async (req: Request, res: Response) => {
      try {
        // Check database connection
        if (AppDataSource.isInitialized) {
          await AppDataSource.query('SELECT 1');
          res.status(200).json({ 
            status: 'UP', 
            message: 'Server is running',
            database: 'Connected'
          });
        } else {
          res.status(503).json({ 
            status: 'DOWN', 
            message: 'Database not initialized',
            database: 'Disconnected'
          });
        }
      } catch (error) {
        res.status(503).json({ 
          status: 'DOWN', 
          message: 'Database connection failed',
          database: 'Error',
          error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
      }
    });

    // Handle 404
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({ message: 'Not Found - The requested resource does not exist' });
    });
  }

  private initializeSwagger() {
    const options = {
      swaggerDefinition: {
        openapi: '3.0.0',
        info: {
          title: 'Evently API',
          version: '1.0.0',
          description: 'Evently - Event Management and Ticket Booking System API Documentation',
          contact: {
            name: 'API Support',
            email: 'support@evently.com',
          },
        },
        servers: [
          {
            url: process.env.NODE_ENV === 'production' 
              ? process.env.RENDER_EXTERNAL_URL || 'https://evently-om2i.onrender.com' 
              : `http://localhost:${config.port}`,
            description: process.env.NODE_ENV === 'production' ? 'Production Server' : 'Development Server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
        security: [
          {
            bearerAuth: [],
          },
        ],
      },
      apis: ['./src/swagger/*.js', './src/routes/*.ts', './src/models/*.ts'],
    };

    const specs = swaggerJsDoc(options);
    
    // Add CORS headers specifically for Swagger docs
    this.app.use('/api-docs', (req: Request, res: Response, next: NextFunction) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      next();
    }, swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
  }

  private initializeErrorHandling() {
    this.app.use(errorHandler);
  }

  public async connectToDatabase() {
    try {
      if (process.env.NODE_ENV === 'test' || process.env.SKIP_DB_CONNECTION === 'true') {
        logger.info('Skipping database connection as per configuration');
        return;
      }
      
      // Log the current database URL (with password masked)
      if (process.env.DATABASE_URL) {
        const maskedUrl = process.env.DATABASE_URL.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@');
        logger.info(`Connecting to database with URL: ${maskedUrl}`);
      } else {
        logger.info(`Connecting to database at ${config.database.host}:${config.database.port}`);
      }
      
      await AppDataSource.initialize();
      logger.info('Database connected successfully');
      
      // Log table creation/synchronization in production
      if (process.env.NODE_ENV === 'production') {
        logger.info('Database synchronization enabled - tables will be created if they do not exist');
      }
    } catch (error) {
      logger.error('Database connection error:', error);
      if (process.env.NODE_ENV !== 'production') {
        logger.warn('Continuing without database connection in development mode');
        return;
      }
      throw error;
    }
  }

  public listen() {
    const port = config.port || 3000;
    
    // Listen on 0.0.0.0 to make the app accessible outside the container
    this.app.listen(port, '0.0.0.0', () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`API Documentation available at http://${config.env === 'production' ? 'your-app-url' : 'localhost:' + port}/api-docs`);
    });
  }
}

export default App;
