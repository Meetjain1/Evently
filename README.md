# Evently - Enterprise Event Management Platform

Evently is a comprehensive, production-ready backend platform designed for large-scale event management and ticket booking operations. Built with enterprise-grade architecture principles, it provides robust APIs for event organizers, venue managers, and end-users to seamlessly manage the complete event lifecycle from creation to analytics.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Core Features](#core-features)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [API Documentation](#api-documentation)
- [Installation Guide](#installation-guide)
- [Development Workflow](#development-workflow)
- [Testing Strategy](#testing-strategy)
- [Deployment](#deployment)
- [Performance & Scalability](#performance--scalability)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## Overview

Evently addresses the complex requirements of modern event management systems by providing a scalable, secure, and feature-rich backend infrastructure. The platform handles everything from user authentication and event creation to seat-level booking management and real-time analytics.

### Key Business Benefits

- **Revenue Optimization**: Advanced seat management and waitlist systems maximize venue capacity utilization
- **Operational Efficiency**: Automated booking workflows reduce manual intervention and human errors  
- **Data-Driven Decisions**: Comprehensive analytics provide insights into event performance and customer behavior
- **Scalable Growth**: Microservice-ready architecture supports business expansion without technical limitations
- **Enterprise Security**: Role-based access control and JWT authentication ensure data protection

## Architecture

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT APPLICATIONS                                │
├─────────────────┬─────────────────┬─────────────────┬─────────────────────────┤
│   Web Frontend  │  Mobile Apps    │  Admin Panel    │   Third-party APIs      │
│   (React/Vue)   │  (iOS/Android)  │  (Management)   │   (Payment/Notifications)│
└─────────────────┴─────────────────┴─────────────────┴─────────────────────────┘
                                       │
                                 ┌─────▼─────┐
                                 │ API Gateway│
                                 │ (Express)  │
                                 └─────┬─────┘
                                       │
┌─────────────────────────────────────▼──────────────────────────────────────────┐
│                            EVENTLY BACKEND API                                 │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌──────────────────┐   │
│  │ Authentication│ │    Events     │ │   Bookings    │ │    Analytics     │   │
│  │   Service     │ │   Service     │ │   Service     │ │    Service       │   │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └────────┬─────────┘   │
│          │                 │                 │                  │             │
│  ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐ ┌────────▼─────────┐   │
│  │     User      │ │     Event     │ │    Booking    │ │    Reporting     │   │
│  │  Controller   │ │  Controller   │ │  Controller   │ │   Controller     │   │
│  └───────┬───────┘ └───────┬───────┘ └───────┬───────┘ └────────┬─────────┘   │
│          │                 │                 │                  │             │
│  ┌───────▼───────┐ ┌───────▼───────┐ ┌───────▼───────┐ ┌────────▼─────────┐   │
│  │  Validation   │ │  Validation   │ │  Validation   │ │   Validation     │   │
│  │  Middleware   │ │  Middleware   │ │  Middleware   │ │   Middleware     │   │
│  └───────────────┘ └───────────────┘ └───────────────┘ └──────────────────┘   │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                           DATA ACCESS LAYER                                    │
├──────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │   TypeORM    │ │   Repository │ │  Connection  │ │    Migration        │    │
│  │   Entities   │ │   Pattern    │ │   Pooling    │ │    Management       │    │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────────────┘    │
└─────────────────────────────────────┬───────────────────────────────────────────┘
                                      │
┌─────────────────────────────────────▼───────────────────────────────────────────┐
│                          DATABASE LAYER                                        │
├──────────────────────────────────────────────────────────────────────────────────┤
│                          PostgreSQL Database                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │    Users     │ │    Events    │ │   Bookings   │ │      Analytics      │    │
│  │    Table     │ │    Table     │ │    Table     │ │       Views         │    │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────────────┘    │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌─────────────────────┐    │
│  │    Venues    │ │    Seats     │ │   Waitlist   │ │      Indexes        │    │
│  │    Table     │ │    Table     │ │    Table     │ │   & Constraints     │    │
│  └──────────────┘ └──────────────┘ └──────────────┘ └─────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### Request Flow Architecture

```
Client Request → Rate Limiter → CORS Handler → Request Logger → JWT Validation
                                                                      │
                                                                      ▼
Route Handler → Validation Middleware → Controller → Service Layer → Repository
                                                                      │
                                                                      ▼
Database Query → Transaction Management → Response Formatting → Client Response
```

### Microservice-Ready Design

The application follows a layered architecture pattern that can be easily decomposed into microservices:

- **Presentation Layer**: Controllers and route handlers
- **Business Logic Layer**: Services containing core business rules
- **Data Access Layer**: Repository pattern with TypeORM
- **Database Layer**: PostgreSQL with optimized schemas

## Core Features

### User Management System
- **Multi-role Authentication**: Support for users, organizers, and administrators
- **JWT-based Security**: Stateless authentication with configurable token expiration
- **Profile Management**: Comprehensive user profile with booking history
- **Password Security**: Bcrypt hashing with salt rounds for password protection

### Event Management Platform
- **Event Lifecycle Management**: Draft, published, cancelled, and completed states
- **Venue Integration**: Complete venue management with capacity and seating configurations  
- **Pricing Flexibility**: Support for variable pricing models and promotional codes
- **Scheduling System**: Advanced date/time management with timezone support

### Advanced Booking Engine
- **Real-time Seat Selection**: Interactive seat maps with availability status
- **Inventory Management**: Atomic booking operations preventing overselling
- **Booking Modifications**: Support for cancellations and modifications with business rules
- **Group Bookings**: Handle multiple ticket purchases in single transactions

### Intelligent Waitlist System
- **Priority Queue Management**: FIFO-based waitlist with position tracking
- **Automatic Notifications**: Email/SMS integration for waitlist status updates
- **Conversion Tracking**: Analytics on waitlist to booking conversion rates
- **Capacity Monitoring**: Intelligent waitlist sizing based on historical data

### Enterprise Analytics
- **Revenue Analytics**: Detailed revenue tracking with time-series analysis
- **Occupancy Metrics**: Venue utilization rates and capacity optimization
- **User Behavior Analysis**: Booking patterns and customer segmentation
- **Performance Dashboards**: Real-time metrics for business decision making

## Technology Stack

### Backend Framework
- **Node.js**: Runtime environment for scalable server-side applications
- **Express.js**: Web framework with middleware ecosystem
- **TypeScript**: Strongly typed JavaScript for enterprise development
- **TypeORM**: Object-relational mapping with database abstraction

### Database & Storage
- **PostgreSQL**: Primary database with ACID compliance
- **Connection Pooling**: Optimized database connection management
- **Migration System**: Version-controlled database schema management
- **Backup Strategy**: Automated backup and recovery procedures

### Security & Authentication
- **JWT (JSON Web Tokens)**: Stateless authentication mechanism
- **Bcrypt**: Password hashing with configurable salt rounds
- **Helmet.js**: Security headers and OWASP protection
- **Rate Limiting**: API rate limiting to prevent abuse

### Development & Operations
- **ESLint**: Code quality and style enforcement
- **Prettier**: Automated code formatting
- **Jest**: Comprehensive testing framework
- **Swagger/OpenAPI**: API documentation and testing interface

### Monitoring & Logging
- **Winston**: Structured logging with multiple transports
- **Morgan**: HTTP request logging middleware
- **Error Tracking**: Centralized error monitoring and alerting

## Database Design

### Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│      Users      │     │     Venues      │     │     Events      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (UUID) PK    │     │ id (UUID) PK    │     │ id (UUID) PK    │
│ firstName       │     │ name            │◄────┤ venueId FK      │
│ lastName        │     │ address         │     │ name            │
│ email (unique)  │     │ city            │     │ description     │
│ password        │     │ state           │     │ startDate       │
│ role (enum)     │     │ zipCode         │     │ endDate         │
│ createdAt       │     │ country         │     │ capacity        │
│ updatedAt       │     │ totalCapacity   │     │ bookedSeats     │
└─────────────────┘     │ hasSeating      │     │ ticketPrice     │
         │               │ creatorId FK    │     │ status (enum)   │
         │               └─────────────────┘     │ hasWaitlist     │
         │                        │              │ maxWaitlistSize │
         │                        │              │ hasSeating      │
         └────────────────────────┼──────────────┤ creatorId FK    │
                                  │              │ createdAt       │
                                  │              │ updatedAt       │
                                  │              └─────────────────┘
                                  │                       │
┌─────────────────┐               │              ┌─────────────────┐
│    Bookings     │               │              │ WaitlistEntries │
├─────────────────┤               │              ├─────────────────┤
│ id (UUID) PK    │               │              │ id (UUID) PK    │
│ userId FK       │◄──────────────┘              │ userId FK       │
│ eventId FK      │◄─────────────────────────────┤ eventId FK      │
│ numberOfTickets │                              │ numberOfTickets │
│ totalAmount     │                              │ position        │
│ status (enum)   │                              │ status (enum)   │
│ paymentRef      │                              │ notifiedAt      │
│ createdAt       │                              │ createdAt       │
│ updatedAt       │                              │ updatedAt       │
└─────────────────┘                              └─────────────────┘
         │                                                │
         │                                                │
         ▼                                                ▼
┌─────────────────┐                              ┌─────────────────┐
│   BookedSeats   │                              │     Seats       │
├─────────────────┤                              ├─────────────────┤
│ id (UUID) PK    │                              │ id (UUID) PK    │
│ bookingId FK    │                              │ venueId FK      │
│ seatId FK       │◄─────────────────────────────┤ eventId FK      │
│ createdAt       │                              │ rowName         │
│ updatedAt       │                              │ seatNumber      │
└─────────────────┘                              │ status (enum)   │
                                                 │ section         │
                                                 │ isAccessible    │
                                                 │ notes           │
                                                 │ createdAt       │
                                                 │ updatedAt       │
                                                 └─────────────────┘
```

### Database Schema Specifications

#### Core Tables

**Users Table**
- Primary authentication and profile management
- Role-based access control (user, admin, organizer)
- Unique email constraint for authentication
- Audit trails with created/updated timestamps

**Events Table**
- Complete event lifecycle management
- Flexible pricing and capacity configuration
- Status-based workflow (draft → published → completed/cancelled)
- Relationship management with venues and creators

**Bookings Table**
- Transactional booking records with payment tracking
- Status management for booking lifecycle
- Financial calculation and audit trail
- Relationship linking users to events

#### Advanced Tables

**Seats Table**
- Granular seat-level inventory management
- Venue-specific seating configurations
- Accessibility and special accommodation support
- Dynamic status tracking (available, reserved, booked)

**Waitlist Entries Table**
- Queue-based waitlist management with position tracking
- Notification system integration
- Conversion tracking from waitlist to booking
- Fair queuing with timestamp-based ordering

### Database Optimization

**Indexing Strategy**
- Primary key indexes on all UUID fields
- Composite indexes on frequently queried combinations
- Partial indexes for status-based queries
- Full-text search indexes for event discovery

**Constraint Management**
- Foreign key constraints ensure referential integrity
- Unique constraints prevent duplicate registrations
- Check constraints enforce business rules
- Cascading deletes maintain data consistency

## API Documentation

### Swagger/OpenAPI Integration

The API documentation is automatically generated and available through Swagger UI at `/api-docs` when the server is running. The documentation includes:

- **Interactive API Testing**: Execute requests directly from the documentation
- **Request/Response Examples**: Real-world examples for all endpoints
- **Schema Validation**: Detailed parameter and response specifications
- **Authentication Flows**: Step-by-step authentication examples

### API Endpoint Categories

#### Authentication & User Management
```
POST   /api/auth/register     - User registration with role assignment
POST   /api/auth/login        - JWT token generation and validation
POST   /api/auth/logout       - Token invalidation and session cleanup
PUT    /api/auth/profile      - User profile management and updates
POST   /api/auth/change-password - Secure password modification
POST   /api/auth/forgot-password - Password reset initialization
POST   /api/auth/reset-password  - Password reset completion
```

#### Event Management Operations
```
GET    /api/events           - Event discovery with filtering and pagination
GET    /api/events/:id       - Detailed event information retrieval
POST   /api/events           - Event creation (organizer/admin only)
PUT    /api/events/:id       - Event modification and updates
DELETE /api/events/:id       - Event deletion and cleanup
GET    /api/events/:id/seats - Seat availability and layout information
```

#### Booking & Transaction Management
```
POST   /api/bookings         - Ticket booking with payment processing
GET    /api/bookings         - User booking history and status
GET    /api/bookings/:id     - Detailed booking information
PUT    /api/bookings/:id     - Booking modifications and cancellations
DELETE /api/bookings/:id     - Booking cancellation with refund processing
```

#### Venue & Capacity Management
```
GET    /api/venues           - Venue discovery and search
GET    /api/venues/:id       - Detailed venue information
POST   /api/venues           - Venue creation (admin only)
PUT    /api/venues/:id       - Venue information updates
GET    /api/venues/:id/events - Events scheduled at specific venue
```

#### Waitlist Management System
```
POST   /api/waitlist         - Waitlist registration for sold-out events
GET    /api/waitlist         - User waitlist status and position
DELETE /api/waitlist/:id     - Waitlist removal and cleanup
GET    /api/waitlist/:eventId - Event-specific waitlist information
```

#### Analytics & Reporting
```
GET    /api/analytics/bookings    - Booking statistics and trends
GET    /api/analytics/events      - Event performance metrics
GET    /api/analytics/revenue     - Revenue analysis and reporting
GET    /api/analytics/utilization - Capacity utilization metrics
```

### Request/Response Examples

#### User Registration
```json
POST /api/auth/register
{
  "firstName": "John",
  "lastName": "Smith",
  "email": "john.smith@example.com",
  "password": "SecurePassword123",
  "role": "user"
}

Response: HTTP 201
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "firstName": "John",
    "lastName": "Smith",
    "email": "john.smith@example.com",
    "role": "user"
  }
}
```

#### Event Creation
```json
POST /api/events
Authorization: Bearer {token}
{
  "name": "Tech Conference 2025",
  "description": "Annual technology conference featuring industry innovations",
  "startDate": "2025-06-15T09:00:00.000Z",
  "endDate": "2025-06-15T18:00:00.000Z",
  "venueId": "660e8400-e29b-41d4-a716-446655440001",
  "capacity": 500,
  "ticketPrice": 149.99,
  "hasWaitlist": true,
  "maxWaitlistSize": 100
}

Response: HTTP 201
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "name": "Tech Conference 2025",
  "status": "draft",
  "bookedSeats": 0,
  "availableSeats": 500
}
```

## Installation Guide

### System Requirements

- **Node.js**: Version 16.0.0 or higher
- **PostgreSQL**: Version 12.0 or higher  
- **Memory**: Minimum 2GB RAM for development
- **Storage**: At least 1GB free space for dependencies and logs

### Local Development Setup

#### Step 1: Repository Setup
```bash
git clone https://github.com/Meetjain1/Evently.git
cd Evently
```

#### Step 2: Dependency Installation
```bash
npm install
```

#### Step 3: Database Configuration
```bash
# Install PostgreSQL (macOS)
brew install postgresql
brew services start postgresql

# Create database and user
createdb evently_db
psql postgres -c "CREATE USER evently_user WITH PASSWORD 'your_password';"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE evently_db TO evently_user;"
```

#### Step 4: Environment Configuration
```bash
cp .env.example .env
```

Edit the `.env` file with your specific configuration:
```env
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=evently_user
DB_PASSWORD=your_password
DB_DATABASE=evently_db
JWT_SECRET=your_super_secure_jwt_secret_key
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
LOG_LEVEL=debug
```

#### Step 5: Database Migration and Seeding
```bash
# Run database migrations
npm run migration:run

# Seed development data (optional)
npm run seed-dev-data
```

#### Step 6: Development Server Launch
```bash
npm run dev
```

The server will start on `http://localhost:3000` with API documentation available at `http://localhost:3000/api-docs`.

### Production Build Process

#### Step 1: Build Compilation
```bash
npm run build
```

#### Step 2: Production Server Launch
```bash
npm start
```

## Development Workflow

### Code Organization

```
src/
├── app.ts                 # Express application configuration
├── index.ts              # Application entry point
├── config/               # Configuration management
│   ├── index.ts          # Environment configuration
│   └── data-source.ts    # Database connection setup
├── controllers/          # Request handling and response formatting
│   ├── auth.controller.ts
│   ├── event.controller.ts
│   └── booking.controller.ts
├── services/             # Business logic and data processing
│   ├── auth.service.ts
│   ├── event.service.ts
│   └── booking.service.ts
├── models/               # Database entity definitions
│   ├── User.ts
│   ├── Event.ts
│   └── Booking.ts
├── middlewares/          # Request processing and validation
│   ├── auth.middleware.ts
│   ├── validation.middleware.ts
│   └── error.middleware.ts
├── routes/               # API endpoint routing
│   ├── auth.routes.ts
│   ├── event.routes.ts
│   └── booking.routes.ts
├── validations/          # Input validation schemas
│   ├── auth.validation.ts
│   └── event.validation.ts
├── utils/                # Utility functions and helpers
│   ├── logger.ts
│   └── helpers.ts
└── swagger/              # API documentation schemas
    ├── auth.swagger.js
    └── event.swagger.js
```

### Development Standards

#### Code Quality Guidelines
- **TypeScript Strict Mode**: Enforced type checking for runtime safety
- **ESLint Configuration**: Comprehensive linting rules for code consistency
- **Prettier Integration**: Automated code formatting on save
- **Pre-commit Hooks**: Automated testing and linting before commits

#### Git Workflow
```bash
# Feature development
git checkout -b feature/booking-system-enhancement
git add .
git commit -m "Add advanced seat selection functionality"
git push origin feature/booking-system-enhancement

# Code review and merge
gh pr create --title "Enhanced Booking System" --body "Detailed description"
```

#### Environment Management
- **Development**: Local PostgreSQL with debug logging
- **Staging**: Cloud database with production-like configuration  
- **Production**: Optimized configuration with error monitoring

## Testing Strategy

### Testing Framework Architecture

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

### Test Categories

#### Unit Testing
- **Service Layer Testing**: Business logic validation
- **Controller Testing**: Request/response handling verification
- **Utility Function Testing**: Helper function correctness
- **Validation Schema Testing**: Input validation rule verification

#### Integration Testing
- **Database Integration**: Repository pattern testing with real database
- **API Endpoint Testing**: Full request lifecycle validation
- **Authentication Flow Testing**: JWT token lifecycle verification
- **Error Handling Testing**: Exception handling and error response validation

#### End-to-End Testing
- **User Journey Testing**: Complete workflow validation
- **Booking Process Testing**: Full booking lifecycle verification
- **Performance Testing**: Load testing under realistic conditions
- **Security Testing**: Authentication and authorization validation

### Test Data Management

```bash
# Load test data
npm run test:seed

# Clean test database
npm run test:clean

# Reset test environment
npm run test:reset
```

## Deployment

### Production Deployment on Render

#### Database Setup
1. **PostgreSQL Service Creation**
   - Create PostgreSQL database instance on Render
   - Configure connection parameters and access controls
   - Set up automated backup schedules

2. **Environment Configuration**
```env
NODE_ENV=production
DATABASE_URL=postgresql://username:password@hostname.render.com/database
PORT=10000
JWT_SECRET=production_jwt_secret_key
JWT_EXPIRES_IN=24h
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=1000
LOG_LEVEL=info
```

#### Web Service Configuration
1. **Repository Connection**: Link GitHub repository to Render
2. **Build Settings**:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Node Version: `16.x`

3. **Environment Variables**: Configure all production environment variables
4. **Health Checks**: Set up application health monitoring
5. **Auto-Deploy**: Enable automatic deployment on main branch updates

### Docker Containerization

#### Dockerfile Configuration
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3000
CMD ["npm", "start"]
```

#### Docker Compose Setup
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    depends_on:
      - postgres
  
  postgres:
    image: postgres:13
    environment:
      POSTGRES_DB: evently_db
      POSTGRES_USER: evently_user
      POSTGRES_PASSWORD: secure_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## Performance & Scalability

### Database Optimization

#### Query Optimization
- **Index Strategy**: Composite indexes on frequently queried columns
- **Query Planning**: EXPLAIN ANALYZE for performance tuning
- **Connection Pooling**: Optimized connection management
- **Read Replicas**: Separate read operations for scalability

#### Caching Strategy
```typescript
// Redis caching for frequently accessed data
import Redis from 'ioredis';

class CacheService {
  private redis = new Redis(process.env.REDIS_URL);
  
  async getEvents(filters: EventFilters): Promise<Event[]> {
    const cacheKey = `events:${JSON.stringify(filters)}`;
    const cached = await this.redis.get(cacheKey);
    
    if (cached) {
      return JSON.parse(cached);
    }
    
    const events = await this.eventRepository.findWithFilters(filters);
    await this.redis.setex(cacheKey, 300, JSON.stringify(events));
    
    return events;
  }
}
```

### Application Performance

#### Monitoring Setup
- **Application Metrics**: Response time, throughput, error rates
- **Database Metrics**: Query performance, connection utilization
- **Infrastructure Metrics**: CPU, memory, disk I/O monitoring
- **Business Metrics**: Booking conversion rates, revenue tracking

#### Load Testing
```bash
# Artillery load testing
npm install -g artillery
artillery run load-test-config.yml

# K6 performance testing  
k6 run performance-test.js
```

### Horizontal Scaling Preparation

#### Microservice Decomposition Strategy
1. **Authentication Service**: User management and JWT operations
2. **Event Service**: Event creation and management
3. **Booking Service**: Booking transactions and inventory
4. **Analytics Service**: Reporting and business intelligence
5. **Notification Service**: Email, SMS, and push notifications

#### API Gateway Integration
- **Request Routing**: Intelligent routing to appropriate services
- **Load Balancing**: Distribute requests across service instances
- **Rate Limiting**: Global and service-specific rate limits
- **Circuit Breaker**: Fault tolerance and service degradation

## Security

### Authentication & Authorization

#### JWT Token Management
```typescript
// Secure JWT implementation
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

class AuthService {
  generateToken(user: User): string {
    return jwt.sign(
      { 
        id: user.id, 
        role: user.role,
        iat: Math.floor(Date.now() / 1000)
      },
      process.env.JWT_SECRET!,
      { 
        expiresIn: process.env.JWT_EXPIRES_IN,
        issuer: 'evently-api',
        audience: 'evently-clients'
      }
    );
  }
  
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }
}
```

#### Role-Based Access Control
- **User Roles**: Standard users with booking capabilities
- **Organizer Roles**: Event creation and management permissions
- **Administrator Roles**: Full system access and user management
- **Service Roles**: Internal service-to-service authentication

### Data Protection

#### Input Validation & Sanitization
```typescript
// Comprehensive validation with Joi
import Joi from 'joi';

const eventValidationSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().trim().required(),
  startDate: Joi.date().iso().greater('now').required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  capacity: Joi.number().integer().min(1).required(),
  ticketPrice: Joi.number().precision(2).min(0).required(),
  venueId: Joi.string().uuid().required()
});
```

#### Security Headers & OWASP Protection
- **Helmet.js Integration**: Comprehensive security header management
- **CORS Configuration**: Controlled cross-origin resource sharing
- **SQL Injection Prevention**: Parameterized queries with TypeORM
- **XSS Protection**: Input sanitization and output encoding

### Audit & Compliance

#### Logging & Monitoring
```typescript
// Structured logging with Winston
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.errors({ stack: true })
  ),
  defaultMeta: { service: 'evently-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console()
  ]
});
```

#### Data Privacy & GDPR Compliance
- **Personal Data Encryption**: Sensitive data encryption at rest
- **Data Retention Policies**: Automated data lifecycle management
- **User Consent Management**: Granular privacy preference controls
- **Right to Deletion**: Complete user data removal capabilities

## Contributing

### Development Environment Setup

1. **Fork the Repository**: Create your own fork of the project
2. **Clone Your Fork**: `git clone https://github.com/yourusername/Evently.git`
3. **Install Dependencies**: `npm install`
4. **Create Feature Branch**: `git checkout -b feature/your-feature-name`
5. **Make Changes**: Implement your improvements
6. **Test Changes**: `npm test` to ensure all tests pass
7. **Commit Changes**: `git commit -m "Add your descriptive commit message"`
8. **Push to Fork**: `git push origin feature/your-feature-name`
9. **Create Pull Request**: Submit your changes for review

### Code Contribution Guidelines

#### Pull Request Requirements
- **Descriptive Title**: Clear summary of changes
- **Detailed Description**: Explain the problem and solution
- **Test Coverage**: Include tests for new functionality
- **Documentation Updates**: Update relevant documentation
- **Breaking Changes**: Clearly document any breaking changes

#### Code Review Process
1. **Automated Checks**: CI/CD pipeline validation
2. **Peer Review**: Code review by maintainers
3. **Testing Verification**: Manual testing of new features
4. **Documentation Review**: Ensure documentation accuracy
5. **Merge Approval**: Final approval and merge to main branch

### Issue Reporting

#### Bug Reports
- **Environment Details**: Operating system, Node.js version, database version
- **Reproduction Steps**: Clear steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Additional Context**: Screenshots, logs, or other relevant information

#### Feature Requests
- **Use Case Description**: Explain the business need
- **Proposed Solution**: Describe your suggested approach
- **Alternative Solutions**: Consider other approaches
- **Implementation Complexity**: Estimate development effort

## License

This project is licensed under the ISC License. See the LICENSE file for detailed terms and conditions.

The ISC License is a permissive free software license that allows for commercial use, modification, distribution, and private use of the software, while requiring preservation of copyright and license notices.

---

**Evently** - Enterprise Event Management Platform  
Built with precision, designed for scale, engineered for success.

1. Clone the repository
```bash
git clone <repository-url>
cd evently
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```
Edit the `.env` file with your database credentials and other configurations.

4. Run database migrations
```bash
npm run migration:run
```

5. Seed the database (optional)
```bash
npm run seed
```

6. Start the development server
```bash
npm run dev
```

7. Build for production
```bash
npm run build
```

8. Start the production server
```bash
npm start
```

## Testing

Run the tests with:
```bash
npm test
```

## API Endpoints

The complete API documentation is available through Swagger at `/api-docs`.

### Main Endpoints Overview:

#### Auth
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login a user

#### Events
- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create a new event (admin)
- `PUT /api/events/:id` - Update an event (admin)
- `DELETE /api/events/:id` - Delete an event (admin)

#### Bookings
- `POST /api/bookings` - Book tickets for an event
- `GET /api/bookings` - Get user's bookings
- `DELETE /api/bookings/:id` - Cancel a booking
- `POST /api/bookings/:id/seats` - Select specific seats

#### Waitlist
- `POST /api/waitlist` - Join the waitlist for an event
- `GET /api/waitlist` - Check waitlist status

#### Analytics (Admin)
- `GET /api/analytics/bookings` - Get booking statistics
- `GET /api/analytics/events` - Get event popularity metrics
- `GET /api/analytics/utilization` - Get capacity utilization data

## Deployment on Render

### Prerequisites
1. Create a Render account at [render.com](https://render.com)
2. Set up a PostgreSQL database in Render

### Database Setup
1. Create a PostgreSQL database on Render
2. Use the **external database URL** for production deployments:
   - Format: `postgresql://username:password@hostname.render.com/database_name`
   - Example: `postgresql://evently_db_iszt_user:password@dpg-d33frdgdl3ps738rr4dg-a.singapore-postgres.render.com/evently_db_iszt`

### Environment Variables
Set the following environment variables in your Render web service:

```
NODE_ENV=production
DATABASE_URL=your-external-postgresql-url
PORT=10000
JWT_SECRET=your-jwt-secret
JWT_EXPIRY=1d
```

### Deployment Steps
1. Connect your GitHub repository to Render
2. Choose "Web Service" as the type
3. Set build command: `npm install && npm run build`
4. Set start command: `npm start`
5. Add the environment variables listed above
6. Deploy the service

### Troubleshooting
- If you encounter CORS issues, they should be fixed with the current configuration
- If database connection issues persist, verify the DATABASE_URL is using the external PostgreSQL URL from Render
- Check Render logs for any other deployment issues

## License

This project is licensed under the ISC License.
