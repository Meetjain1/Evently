# Evently - Event Management System

## Architecture Documentation

This document describes the architecture of the Evently application, a system for managing events, venues, bookings, and waitlists.

## Table of Contents

1. [System Overview](#system-overview)
2. [Tech Stack](#tech-stack)
3. [System Architecture](#system-architecture)
4. [Database Schema](#database-schema)
5. [API Structure](#api-structure)
6. [Authentication & Authorization](#authentication--authorization)
7. [Error Handling](#error-handling)
8. [Development Workflow](#development-workflow)
9. [Deployment](#deployment)

## System Overview

Evently is a comprehensive event management system that allows:
- Creating and managing venues
- Creating and publishing events
- Handling ticket bookings and cancellations
- Managing seat assignments for events with seating
- Implementing waitlists for popular events
- Generating statistics and reports

The system provides a REST API for frontend applications to consume.

## Tech Stack

- **Backend Framework**: Node.js with Express.js
- **Language**: TypeScript
- **Database**: MySQL
- **ORM**: TypeORM
- **Authentication**: JWT (JSON Web Tokens)
- **API Documentation**: Swagger/OpenAPI 3.0
- **Logging**: Winston
- **Testing**: Jest for unit tests, custom script for API testing
- **Rate Limiting**: Express Rate Limit
- **Validation**: Class-validator and class-transformer

## System Architecture

The application follows a layered architecture:

```
┌───────────────────────────────────────────────────────────┐
│                    Client Applications                     │
└───────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│                     Express Application                    │
│                                                           │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │  Middleware   │  │    Routes     │  │    Swagger    │  │
│  │  - Auth       │  │  - auth       │  │  Documentation│  │
│  │  - Rate Limit │  │  - users      │  └───────────────┘  │
│  │  - Error      │  │  - venues     │                     │
│  │  - Validation │  │  - events     │  ┌───────────────┐  │
│  └───────────────┘  │  - bookings   │  │    Logging    │  │
│                     │  - seats      │  │    (Winston)  │  │
│                     │  - waitlist   │  └───────────────┘  │
│                     └───────────────┘                     │
└───────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│                        Controllers                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │AuthController│ │UserController│ │   VenueController  │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │EventController│ │SeatController│ │  BookingController │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐                          │
│  │WaitlistCtrl │ │  StatsCtrl  │                          │
│  └─────────────┘ └─────────────┘                          │
└───────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│                        Services                            │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │ AuthService │ │ UserService │ │    VenueService     │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │EventService │ │ SeatService │ │   BookingService    │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
│  ┌─────────────┐ ┌─────────────┐                          │
│  │WaitlistSvc  │ │  StatsSvc   │                          │
│  └─────────────┘ └─────────────┘                          │
└───────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│                      Data Access Layer                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────┐  │
│  │ TypeORM     │ │ Repositories│ │      Entities       │  │
│  │ DataSource  │ │ - UserRepo  │ │  - User            │  │
│  │             │ │ - VenueRepo │ │  - Venue           │  │
│  │             │ │ - EventRepo │ │  - Event           │  │
│  │             │ │ - BookingRep│ │  - Booking         │  │
│  │             │ │ - SeatRepo  │ │  - Seat            │  │
│  │             │ │ - WaitlistR │ │  - WaitlistEntry   │  │
│  └─────────────┘ └─────────────┘ └─────────────────────┘  │
└───────────────────────────────────────────────────────────┘
                             │
                             ▼
┌───────────────────────────────────────────────────────────┐
│                          MySQL                             │
└───────────────────────────────────────────────────────────┘
```

### Key Components

1. **Routes**: Define the API endpoints and link them to controller methods.
2. **Middleware**: Handle cross-cutting concerns like authentication, validation, and error handling.
3. **Controllers**: Process HTTP requests, invoke services, and return responses.
4. **Services**: Implement business logic and interact with repositories.
5. **Repositories**: Provide data access methods for entities.
6. **Entities**: Define the data structure and relationships.
7. **Database**: Stores the application data.

## Database Schema

The database schema consists of the following main tables:

1. **user**: Stores user information and credentials.
2. **venue**: Contains venue details including capacity and location.
3. **event**: Stores event information, linking to venues and creators.
4. **booking**: Records ticket bookings for events.
5. **seat**: Manages individual seats for events with seating plans.
6. **waitlist_entry**: Tracks waitlist requests for events.

### Entity Relationships

- A **User** can create multiple **Venues** and **Events**
- A **User** can make multiple **Bookings**
- A **Venue** can host multiple **Events**
- An **Event** can have multiple **Bookings**, **Seats**, and **WaitlistEntries**
- A **Booking** belongs to one **User** and one **Event**
- A **Seat** belongs to one **Event** and one **Venue**
- A **WaitlistEntry** belongs to one **Event** and optionally to one **User**

## API Structure

The API follows RESTful principles and is organized into the following resource groups:

1. **Auth**: `/api/auth/*` - Authentication endpoints
2. **Users**: `/api/users/*` - User management
3. **Venues**: `/api/venues/*` - Venue management
4. **Events**: `/api/events/*` - Event management
5. **Bookings**: `/api/bookings/*` - Booking operations
6. **Seats**: `/api/seats/*` and `/api/events/:id/seats` - Seat management
7. **Waitlist**: `/api/waitlist/*` and `/api/events/:id/waitlist` - Waitlist operations
8. **Statistics**: `/api/stats/*` - Reporting and statistics

Detailed API documentation is available in the API_TESTING_GUIDE.md file.

## Authentication & Authorization

The system uses JWT (JSON Web Tokens) for authentication:

1. Users register or login to receive a JWT token.
2. This token must be included in the Authorization header for protected routes.
3. The auth middleware validates the token and extracts the user ID.
4. Role-based authorization controls access to specific endpoints (admin vs. regular user).

Security features:
- Password hashing using bcrypt
- Token expiration
- Role-based access control
- Rate limiting to prevent brute force attacks

## Error Handling

The application implements a centralized error handling mechanism:

1. Custom error classes for different types of errors (not found, unauthorized, etc.)
2. Global error handling middleware to process errors consistently
3. Standardized error response format for API consumers
4. Detailed logging for debugging while maintaining security

Error response format:
```json
{
  "status": "error",
  "code": 404,
  "message": "Resource not found",
  "details": "Event with ID xyz123 does not exist"
}
```

## Development Workflow

### Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables in `.env` file
4. Initialize the database: `npm run db:init`
5. Start the development server: `npm run dev`

### Scripts

- `npm run build`: Compile TypeScript to JavaScript
- `npm run start`: Start the production server
- `npm run dev`: Start the development server with hot reloading
- `npm run test`: Run unit tests
- `npm run lint`: Run ESLint for code quality
- `./scripts/test-api.sh`: Run API endpoint tests
- `./dev-scripts/generate-test-data.js`: Generate test data
- `./dev-scripts/import-test-data.js`: Import test data into database
- `./dev-scripts/generate-api-docs.js`: Generate API documentation

### Environment Variables

The application uses the following environment variables:

- `NODE_ENV`: Environment (development, production, test)
- `PORT`: Server port (defaults to 3000)
- `DB_HOST`: Database host
- `DB_PORT`: Database port
- `DB_USERNAME`: Database username
- `DB_PASSWORD`: Database password
- `DB_DATABASE`: Database name
- `JWT_SECRET`: Secret for signing JWT tokens
- `JWT_EXPIRATION`: Token expiration time
- `RATE_LIMIT_WINDOW`: Rate limiting window in milliseconds
- `RATE_LIMIT_MAX`: Maximum requests in the window

## Deployment

### Prerequisites

- Node.js v14+
- MySQL 8.0+
- Proper environment configuration

### Deployment Steps

1. Build the application: `npm run build`
2. Set up production environment variables
3. Initialize the database: `npm run db:init`
4. Start the server: `npm run start`

### Production Considerations

- Use process manager like PM2 to keep the application running
- Set up NGINX or similar as a reverse proxy
- Configure SSL for secure communication
- Implement proper logging and monitoring
- Consider containerization with Docker for easier deployment
