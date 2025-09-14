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
import { ensurePort3000IsAvailable } from './utils/port-check';

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
    this.app.use(helmet());
    this.app.use(cors());
    this.app.use(compression());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(morgan('combined', { stream: { write: (message: string) => logger.info(message.trim()) } }));
    this.app.use(apiRateLimiter);
  }

  private initializeRoutes() {
    this.app.use(config.apiPrefix, routes);
    
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.status(200).json({ status: 'UP', message: 'Server is running' });
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
            url: 'http://localhost:3000',
            description: 'Development Server',
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
    this.app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));
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
      
      await AppDataSource.initialize();
      logger.info('Database connected successfully');
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
    // Check if port 3000 is available, if not, try to free it
    ensurePort3000IsAvailable();
    
    this.app.listen(3000, 'localhost', () => {
      logger.info('Server running on port 3000');
      logger.info('API Documentation available at http://localhost:3000/api-docs');
    });
  }
}

export default App;
