# Development Guide

This document provides guidelines and best practices for developing and extending the Evently application.

## Getting Started

### Prerequisites

- Node.js (v14+)
- npm or yarn
- MySQL database
- Git

### Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd evently
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   NODE_ENV=development
   PORT=3000
   DATABASE_HOST=localhost
   DATABASE_PORT=3306
   DATABASE_USERNAME=root
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=evently
   JWT_SECRET=your_jwt_secret_key
   JWT_EXPIRATION=24h
   ```

4. Run database migrations:
   ```bash
   npm run migration:run
   ```

5. Seed development data:
   ```bash
   npm run seed-dev-data
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

## Project Structure

```
evently/
├── src/
│   ├── controllers/       # Request handlers
│   ├── database/          # Database configuration and migrations
│   ├── dtos/              # Data transfer objects
│   ├── interfaces/        # TypeScript interfaces
│   ├── middleware/        # Express middleware
│   ├── models/            # Data models and entities
│   ├── repositories/      # Data access layer
│   ├── routes/            # API route definitions
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── validators/        # Request validation schemas
│   ├── app.ts             # Express application setup
│   ├── config.ts          # Configuration settings
│   ├── logger.ts          # Logging configuration
│   └── server.ts          # Application entry point
├── dev-scripts/           # Development utility scripts
├── docs/                  # Documentation
├── tests/                 # Test files
├── .env                   # Environment variables
├── .gitignore             # Git ignore file
├── package.json           # Project metadata and dependencies
├── tsconfig.json          # TypeScript configuration
└── README.md              # Project overview
```

## Coding Standards

### General Guidelines

1. Follow the TypeScript coding style guide
2. Use async/await for asynchronous operations
3. Properly handle errors and exceptions
4. Write descriptive comments for complex logic
5. Keep functions small and focused on a single responsibility
6. Use meaningful variable and function names

### Naming Conventions

- **Files and Directories**: Use kebab-case for file and directory names
  - Example: `user-profile.controller.ts`
- **Classes**: Use PascalCase for class names
  - Example: `class UserProfileController {}`
- **Interfaces**: Use PascalCase prefixed with "I" for interfaces
  - Example: `interface IUserProfileResponse {}`
- **Variables and Functions**: Use camelCase for variables and functions
  - Example: `const getUserProfile = () => {}`
- **Constants**: Use UPPER_SNAKE_CASE for constants
  - Example: `const MAX_LOGIN_ATTEMPTS = 5`

### Import Order

Organize imports in the following order:
1. Node.js built-in modules
2. External dependencies
3. Internal modules
4. Type imports

Example:
```typescript
// Node.js built-in modules
import * as path from 'path';
import * as fs from 'fs';

// External dependencies
import express from 'express';
import { v4 as uuidv4 } from 'uuid';

// Internal modules
import { logger } from '../logger';
import { UserService } from '../services/user.service';

// Type imports
import type { Request, Response } from 'express';
import type { IUser } from '../interfaces/user.interface';
```

## Database Operations

### Entity Creation

When creating new entities:

1. Define the entity model in `src/models/`
2. Create a repository in `src/repositories/`
3. Create a service in `src/services/`
4. Generate a migration with `npm run migration:generate -- -n EntityName`
5. Run the migration with `npm run migration:run`

Example entity:

```typescript
// src/models/event.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Venue } from './venue.entity';
import { Seat } from './seat.entity';

@Entity('events')
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  startDate: Date;

  @Column()
  endDate: Date;

  @ManyToOne(() => Venue, venue => venue.events)
  venue: Venue;

  @Column()
  venueId: string;

  @ManyToOne(() => User)
  creator: User;

  @Column()
  creatorId: string;

  @Column()
  capacity: number;

  @Column({ default: 0 })
  bookedSeats: number;

  @Column('decimal', { precision: 10, scale: 2 })
  ticketPrice: number;

  @Column({ default: false })
  isPublished: boolean;

  @OneToMany(() => Seat, seat => seat.event)
  seats: Seat[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Database Best Practices

1. **Use Transactions**: Wrap related operations in transactions
   ```typescript
   @Transaction()
   async createBooking(data: CreateBookingDto, userId: string) {
     // Transaction operations
   }
   ```

2. **Implement Pagination**: Use pagination for list operations
   ```typescript
   async getEvents(params: GetEventsParams) {
     const { page = 1, limit = 10 } = params;
     const [items, total] = await this.eventRepository.findAndCount({
       skip: (page - 1) * limit,
       take: limit,
     });
     return { items, total, page, limit };
   }
   ```

3. **Use Eager Loading**: Load related entities when needed
   ```typescript
   await this.eventRepository.findOne({
     where: { id },
     relations: ['venue', 'creator', 'seats'],
   });
   ```

4. **Handle Concurrency**: Use optimistic locking for concurrent operations
   ```typescript
   @Entity()
   export class Event {
     // ...
     @VersionColumn()
     version: number;
   }
   ```

## API Development

### Controller Pattern

Follow the controller pattern:

```typescript
// src/controllers/event.controller.ts
import { Request, Response } from 'express';
import { logger } from '../logger';
import { EventService } from '../services/event.service';
import { validateEvent } from '../validators/event.validator';

export class EventController {
  constructor(private eventService: EventService) {}

  async getEvents(req: Request, res: Response) {
    try {
      const events = await this.eventService.getEvents(req.query);
      return res.json({ success: true, data: events });
    } catch (error) {
      logger.error('Error getting events', { error });
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async createEvent(req: Request, res: Response) {
    try {
      // Validate request body
      const { error, value } = validateEvent(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      // Create event
      const event = await this.eventService.createEvent(value, req.user.id);
      return res.status(201).json({ success: true, data: event });
    } catch (error) {
      logger.error('Error creating event', { error });
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}
```

### Route Definitions

Organize routes by resource:

```typescript
// src/routes/event.routes.ts
import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { EventService } from '../services/event.service';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/authorization.middleware';

const router = Router();
const eventService = new EventService();
const eventController = new EventController(eventService);

router.get('/', eventController.getEvents.bind(eventController));
router.get('/:id', eventController.getEvent.bind(eventController));
router.post('/', authenticate, authorize(['admin']), eventController.createEvent.bind(eventController));
router.put('/:id', authenticate, authorize(['admin']), eventController.updateEvent.bind(eventController));
router.delete('/:id', authenticate, authorize(['admin']), eventController.deleteEvent.bind(eventController));

export default router;
```

### Middleware

Create middleware for cross-cutting concerns:

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../logger';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    logger.error('Authentication error', { error });
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
};
```

## Error Handling

### Centralized Error Handling

Create a centralized error handler:

```typescript
// src/middleware/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logger';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        success: false,
        message: err.message,
      });
    }
  }

  // Log unexpected errors
  logger.error('Unexpected error', { error: err });

  // Don't expose error details in production
  const message = process.env.NODE_ENV === 'production' 
    ? 'Something went wrong' 
    : err.message;

  return res.status(500).json({
    success: false,
    message,
  });
};
```

### Error Types

Create specific error types:

```typescript
// src/utils/errors.ts
import { AppError } from '../middleware/error.middleware';

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class UnauthorizedError extends AppError {
  constructor() {
    super('Unauthorized', 401);
  }
}

export class ForbiddenError extends AppError {
  constructor() {
    super('Forbidden', 403);
  }
}
```

## Logging

Use structured logging:

```typescript
// src/logger.ts
import winston from 'winston';
import { config } from './config';

const logger = winston.createLogger({
  level: config.logLevel || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'evently-api' },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
  ],
});

// Add file transport in production
if (process.env.NODE_ENV === 'production') {
  logger.add(
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' })
  );
  logger.add(
    new winston.transports.File({ filename: 'logs/combined.log' })
  );
}

export { logger };
```

## Testing

### Unit Tests

Create unit tests for individual components:

```typescript
// tests/unit/services/event.service.test.ts
import { EventService } from '../../../src/services/event.service';
import { EventRepository } from '../../../src/repositories/event.repository';

// Mock the repository
jest.mock('../../../src/repositories/event.repository');

describe('EventService', () => {
  let eventService: EventService;
  let mockEventRepository: jest.Mocked<EventRepository>;

  beforeEach(() => {
    mockEventRepository = new EventRepository() as jest.Mocked<EventRepository>;
    eventService = new EventService(mockEventRepository);
  });

  describe('getEvents', () => {
    it('should return paginated events', async () => {
      // Arrange
      const mockEvents = [{ id: '1', title: 'Test Event' }];
      mockEventRepository.findAndCount.mockResolvedValue([mockEvents, 1]);

      // Act
      const result = await eventService.getEvents({ page: 1, limit: 10 });

      // Assert
      expect(mockEventRepository.findAndCount).toHaveBeenCalled();
      expect(result.items).toEqual(mockEvents);
      expect(result.total).toEqual(1);
    });
  });
});
```

### Integration Tests

Create integration tests for API endpoints:

```typescript
// tests/integration/api/events.test.ts
import request from 'supertest';
import { app } from '../../../src/app';
import { createTestUser, createTestEvent, getAuthToken } from '../../test-utils';

describe('Event API', () => {
  let authToken: string;
  let adminAuthToken: string;

  beforeAll(async () => {
    // Create test users and get auth tokens
    const user = await createTestUser({ role: 'user' });
    const admin = await createTestUser({ role: 'admin' });
    authToken = await getAuthToken(user.email, 'password');
    adminAuthToken = await getAuthToken(admin.email, 'password');
  });

  describe('GET /api/events', () => {
    it('should return a list of events', async () => {
      // Create test events
      await createTestEvent({ title: 'Test Event 1' });
      await createTestEvent({ title: 'Test Event 2' });

      // Test API
      const response = await request(app)
        .get('/api/events')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data.items)).toBe(true);
      expect(response.body.data.items.length).toBeGreaterThan(0);
    });
  });
});
```

## Documentation

### API Documentation

Document API endpoints with Swagger:

```typescript
// src/routes/event.routes.ts
/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get a list of events
 *     description: Retrieve a paginated list of events
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Event'
 *                     total:
 *                       type: integer
 *                       example: 100
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 */
router.get('/', eventController.getEvents.bind(eventController));
```

## Deployment

### Production Setup

1. Build the application:
   ```bash
   npm run build
   ```

2. Set up production environment variables:
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_HOST=<production-db-host>
   DATABASE_PORT=3306
   DATABASE_USERNAME=<db-username>
   DATABASE_PASSWORD=<db-password>
   DATABASE_NAME=evently
   JWT_SECRET=<strong-secret-key>
   JWT_EXPIRATION=24h
   LOG_LEVEL=info
   ```

3. Start the application:
   ```bash
   npm start
   ```

### Docker Deployment

1. Build Docker image:
   ```bash
   docker build -t evently-api .
   ```

2. Run Docker container:
   ```bash
   docker run -p 3000:3000 --env-file .env.production evently-api
   ```

## Continuous Integration

Set up CI/CD pipeline:

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    services:
      mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: root
          MYSQL_DATABASE: evently_test
        ports:
          - 3306:3306
        options: --health-cmd="mysqladmin ping" --health-interval=10s --health-timeout=5s --health-retries=3

    steps:
      - uses: actions/checkout@v2
      
      - name: Set up Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '14'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Lint
        run: npm run lint
        
      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test
          DATABASE_HOST: localhost
          DATABASE_PORT: 3306
          DATABASE_USERNAME: root
          DATABASE_PASSWORD: root
          DATABASE_NAME: evently_test
          JWT_SECRET: test_secret
          
      - name: Build
        run: npm run build
```

## Performance Optimization

1. **Implement Caching**: Cache frequently accessed data
   ```typescript
   // src/services/event.service.ts
   import NodeCache from 'node-cache';

   const cache = new NodeCache({ stdTTL: 60 }); // 60 seconds TTL

   export class EventService {
     async getPopularEvents() {
       const cacheKey = 'popular_events';
       const cachedEvents = cache.get(cacheKey);
       
       if (cachedEvents) {
         return cachedEvents;
       }
       
       const events = await this.eventRepository.findPopularEvents();
       cache.set(cacheKey, events);
       return events;
     }
   }
   ```

2. **Database Indexing**: Create indexes for frequent queries
   ```typescript
   // src/database/migrations/1234567890-AddEventIndexes.ts
   import { MigrationInterface, QueryRunner } from 'typeorm';

   export class AddEventIndexes1234567890 implements MigrationInterface {
     public async up(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`
         CREATE INDEX idx_events_start_date ON events (startDate);
         CREATE INDEX idx_events_venue_id ON events (venueId);
         CREATE INDEX idx_events_is_published ON events (isPublished);
       `);
     }

     public async down(queryRunner: QueryRunner): Promise<void> {
       await queryRunner.query(`
         DROP INDEX idx_events_start_date ON events;
         DROP INDEX idx_events_venue_id ON events;
         DROP INDEX idx_events_is_published ON events;
       `);
     }
   }
   ```

3. **Rate Limiting**: Implement API rate limiting
   ```typescript
   // src/middleware/rate-limit.middleware.ts
   import rateLimit from 'express-rate-limit';

   export const apiLimiter = rateLimit({
     windowMs: 15 * 60 * 1000, // 15 minutes
     max: 100, // limit each IP to 100 requests per windowMs
     message: {
       success: false,
       message: 'Too many requests, please try again later.'
     }
   });
   ```

## Extending the Application

### Adding a New Feature

1. **Identify Requirements**: Define what the feature should accomplish
2. **Design Database Changes**: Update models and create migrations
3. **Implement Backend Logic**: Create services, controllers, and routes
4. **Document API Changes**: Update Swagger documentation
5. **Write Tests**: Create unit and integration tests
6. **Deploy Changes**: Follow the deployment process

### Example: Adding Ratings Feature

1. Create a new entity:
   ```typescript
   // src/models/rating.entity.ts
   import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
   import { User } from './user.entity';
   import { Event } from './event.entity';

   @Entity('ratings')
   export class Rating {
     @PrimaryGeneratedColumn('uuid')
     id: string;

     @ManyToOne(() => User)
     user: User;

     @Column()
     userId: string;

     @ManyToOne(() => Event)
     event: Event;

     @Column()
     eventId: string;

     @Column({ type: 'int', min: 1, max: 5 })
     score: number;

     @Column({ type: 'text', nullable: true })
     comment: string;

     @CreateDateColumn()
     createdAt: Date;
   }
   ```

2. Create migration:
   ```bash
   npm run migration:generate -- -n AddRatingsTable
   ```

3. Implement service:
   ```typescript
   // src/services/rating.service.ts
   import { RatingRepository } from '../repositories/rating.repository';

   export class RatingService {
     constructor(private ratingRepository: RatingRepository) {}

     async rateEvent(userId: string, eventId: string, score: number, comment?: string) {
       // Check if user has already rated this event
       const existingRating = await this.ratingRepository.findOne({
         where: { userId, eventId }
       });

       if (existingRating) {
         // Update existing rating
         existingRating.score = score;
         existingRating.comment = comment;
         return this.ratingRepository.save(existingRating);
       }

       // Create new rating
       const rating = this.ratingRepository.create({
         userId,
         eventId,
         score,
         comment
       });

       return this.ratingRepository.save(rating);
     }

     async getEventRatings(eventId: string, params: any) {
       const { page = 1, limit = 10 } = params;
       
       return this.ratingRepository.findAndCount({
         where: { eventId },
         relations: ['user'],
         skip: (page - 1) * limit,
         take: limit,
         order: { createdAt: 'DESC' }
       });
     }

     async getAverageEventRating(eventId: string) {
       const result = await this.ratingRepository
         .createQueryBuilder('rating')
         .select('AVG(rating.score)', 'average')
         .where('rating.eventId = :eventId', { eventId })
         .getRawOne();
       
       return result ? parseFloat(result.average) : 0;
     }
   }
   ```

4. Create controller and routes:
   ```typescript
   // src/controllers/rating.controller.ts
   import { Request, Response } from 'express';
   import { RatingService } from '../services/rating.service';
   import { validateRating } from '../validators/rating.validator';
   import { logger } from '../logger';

   export class RatingController {
     constructor(private ratingService: RatingService) {}

     async rateEvent(req: Request, res: Response) {
       try {
         const { error, value } = validateRating(req.body);
         if (error) {
           return res.status(400).json({ success: false, message: error.details[0].message });
         }

         const rating = await this.ratingService.rateEvent(
           req.user.id,
           req.params.eventId,
           value.score,
           value.comment
         );

         return res.status(201).json({ success: true, data: rating });
       } catch (error) {
         logger.error('Error rating event', { error });
         return res.status(500).json({ success: false, message: 'Internal server error' });
       }
     }

     async getEventRatings(req: Request, res: Response) {
       try {
         const [ratings, total] = await this.ratingService.getEventRatings(
           req.params.eventId,
           req.query
         );

         const page = parseInt(req.query.page as string) || 1;
         const limit = parseInt(req.query.limit as string) || 10;

         return res.json({
           success: true,
           data: {
             items: ratings,
             total,
             page,
             limit
           }
         });
       } catch (error) {
         logger.error('Error getting event ratings', { error });
         return res.status(500).json({ success: false, message: 'Internal server error' });
       }
     }

     async getAverageEventRating(req: Request, res: Response) {
       try {
         const average = await this.ratingService.getAverageEventRating(req.params.eventId);
         return res.json({ success: true, data: { average } });
       } catch (error) {
         logger.error('Error getting average event rating', { error });
         return res.status(500).json({ success: false, message: 'Internal server error' });
       }
     }
   }
   ```

   ```typescript
   // src/routes/rating.routes.ts
   import { Router } from 'express';
   import { RatingController } from '../controllers/rating.controller';
   import { RatingService } from '../services/rating.service';
   import { authenticate } from '../middleware/auth.middleware';

   const router = Router();
   const ratingService = new RatingService();
   const ratingController = new RatingController(ratingService);

   router.post('/events/:eventId/ratings', authenticate, ratingController.rateEvent.bind(ratingController));
   router.get('/events/:eventId/ratings', ratingController.getEventRatings.bind(ratingController));
   router.get('/events/:eventId/ratings/average', ratingController.getAverageEventRating.bind(ratingController));

   export default router;
   ```

5. Update app.ts to include the new routes:
   ```typescript
   // src/app.ts
   import ratingRoutes from './routes/rating.routes';
   
   // ...
   
   app.use('/api', ratingRoutes);
   ```

6. Create tests:
   ```typescript
   // tests/unit/services/rating.service.test.ts
   import { RatingService } from '../../../src/services/rating.service';
   import { RatingRepository } from '../../../src/repositories/rating.repository';

   // Mock the repository
   jest.mock('../../../src/repositories/rating.repository');

   describe('RatingService', () => {
     let ratingService: RatingService;
     let mockRatingRepository: jest.Mocked<RatingRepository>;

     beforeEach(() => {
       mockRatingRepository = new RatingRepository() as jest.Mocked<RatingRepository>;
       ratingService = new RatingService(mockRatingRepository);
     });

     describe('rateEvent', () => {
       it('should create a new rating if user has not rated the event', async () => {
         // Arrange
         mockRatingRepository.findOne.mockResolvedValue(null);
         mockRatingRepository.create.mockReturnValue({ id: '1', score: 5 });
         mockRatingRepository.save.mockResolvedValue({ id: '1', score: 5 });

         // Act
         const result = await ratingService.rateEvent('user1', 'event1', 5);

         // Assert
         expect(mockRatingRepository.findOne).toHaveBeenCalledWith({
           where: { userId: 'user1', eventId: 'event1' }
         });
         expect(mockRatingRepository.create).toHaveBeenCalledWith({
           userId: 'user1',
           eventId: 'event1',
           score: 5,
           comment: undefined
         });
         expect(mockRatingRepository.save).toHaveBeenCalled();
         expect(result).toEqual({ id: '1', score: 5 });
       });
     });
   });
   ```
