# Evently Architecture

This document outlines the high-level architecture of the Evently platform, including the system design, database schema, and key design decisions.

## High-Level Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client         │     │  API Server     │     │  Database       │
│  (Browser/App)  │◄────►  (Express)      │◄────►  (MySQL)        │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                              │
                              │
                        ┌─────▼─────┐
                        │           │
                        │  Services │
                        │           │
                        └───────────┘
```

### Core Components

1. **API Server (Express)**: Handles HTTP requests, implements routing, middleware, and controller logic.
2. **Database (MySQL)**: Stores application data in a relational database.
3. **Services Layer**: Implements business logic, data access, and domain-specific operations.
4. **Controllers**: Handle HTTP requests and responses, delegating business logic to services.
5. **Middleware**: Implements cross-cutting concerns like authentication, error handling, and request validation.
6. **Models**: Define the structure of the application's data and entities.

## Entity Relationship Diagram (ERD)

```
┌───────────┐     ┌───────────┐     ┌───────────┐
│           │     │           │     │           │
│  Users    │◄────┤  Events   │◄────┤  Venues   │
│           │     │           │     │           │
└───────────┘     └───────────┘     └───────────┘
      ▲                 ▲                 ▲
      │                 │                 │
      │            ┌────┴────┐            │
┌─────┴─────┐      │         │      ┌─────┴─────┐
│           │      │  Seats  │      │           │
│  Bookings │◄─────┤         │◄─────┤  Waitlist │
│           │      └─────────┘      │           │
└───────────┘                       └───────────┘
```

### Key Entities

1. **User**: Represents system users (admin, regular users).
2. **Venue**: Physical locations where events take place.
3. **Event**: Events hosted at venues, including details like date, time, capacity.
4. **Seat**: Individual seats within venues, can be assigned to specific events.
5. **Booking**: Ticket reservations made by users for events.
6. **Waitlist**: Queue of users waiting for tickets if an event is sold out.

## Design Decisions

### Concurrency Control

The system implements optimistic concurrency control to handle concurrent booking operations:

1. **Event Version Tracking**: Each event has a version counter that increments on update.
2. **Transaction Isolation**: Database transactions ensure that operations like booking are atomic.
3. **Seat Status Management**: Seat status transitions (available → reserved → booked) prevent double bookings.

```typescript
// Example of optimistic locking in booking service
@Transaction()
async createBooking(input: CreateBookingInput, userId: string) {
  // Lock the event for update
  const event = await this.eventRepository.findOne({
    where: { id: input.eventId },
    lock: { mode: 'pessimistic_write' }
  });
  
  // Check availability
  if (event.bookedSeats + input.numberOfTickets > event.capacity) {
    throw new Error('Not enough tickets available');
  }
  
  // Update event
  event.bookedSeats += input.numberOfTickets;
  await this.eventRepository.save(event);
  
  // Create booking
  // ...
}
```

### Scalability Considerations

1. **Connection Pooling**: Database connections are managed through a connection pool for efficient resource utilization.
2. **Pagination**: All list endpoints implement pagination to limit result sets and improve performance.
3. **Caching**: (Planned) Implementation of Redis caching for frequently accessed data like event listings.
4. **Rate Limiting**: API endpoints are protected with rate limiting to prevent abuse.

```typescript
// Example of pagination implementation
async getEvents(params: GetEventsQueryParams): Promise<PaginationResult<Event>> {
  const { page = 1, limit = 10, sort = 'startDate', order = 'ASC' } = params;
  
  const [items, total] = await this.eventRepository.findAndCount({
    where: { /* filters */ },
    order: { [sort]: order },
    skip: (page - 1) * limit,
    take: limit,
    relations: ['venue', 'creator']
  });
  
  return paginateResponse(items, total, page, limit);
}
```

### Security Measures

1. **JWT Authentication**: Stateless authentication using signed JSON Web Tokens.
2. **Role-Based Access Control**: Permissions based on user roles (admin, user).
3. **Input Validation**: All API inputs are validated using Joi schemas.
4. **Password Hashing**: User passwords are securely hashed using bcrypt.
5. **HTTPS Support**: Production deployment enforces HTTPS.

## API Design

The API follows RESTful principles with the following characteristics:

1. **Resource-Based Routes**: API endpoints are organized around resources.
2. **Standard HTTP Methods**: GET, POST, PUT, DELETE for CRUD operations.
3. **Consistent Response Format**: Standardized JSON response structure.
4. **Error Handling**: Structured error responses with appropriate HTTP status codes.
5. **Swagger Documentation**: Complete API documentation with request/response schemas.

## Future Enhancements

1. **Microservices Architecture**: Splitting the monolith into dedicated services for bookings, events, users.
2. **Message Queue**: Implementing a message queue for asynchronous processing of notifications and background tasks.
3. **GraphQL API**: Adding a GraphQL endpoint for more flexible data querying.
4. **Distributed Caching**: Implementing Redis for improved caching and session management.
5. **Containerization**: Docker and Kubernetes deployment for better scalability and infrastructure management.
