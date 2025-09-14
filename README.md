# Evently

A scalable backend system for an event booking platform with features for users to browse events, book tickets, and manage bookings, and for admins to create and manage events and view analytics.

## Features

### User Features
- Browse a list of upcoming events with details (name, venue, time, capacity)
- Book and cancel tickets, ensuring seat availability is updated correctly
- View booking history

### Admin Features
- Create, update, and manage events
- View booking analytics (total bookings, most popular events, capacity utilization)

### Advanced Features
- Waitlist system: Users can join a waitlist when an event is full
- Seat-level booking: Allow users to pick specific seats within a venue
- Notifications: Inform users if a waitlist spot opens
- Advanced analytics: Endpoints for most-booked events, cancellation rates, and daily booking stats

## System Design

### Concurrency & Race Conditions
- Transactional booking process to prevent overselling
- Optimistic locking on events during booking
- Queue system for high-demand events

### Database Design
- Relational model for Users, Events, Bookings, Seats, and Waitlists
- Proper constraints for referential integrity
- Indexes for performance optimization

### Scalability
- RESTful API design for horizontal scaling
- Connection pooling for database efficiency
- Caching layer for popular events and analytics
- Rate limiting to prevent abuse

## API Documentation

API documentation is available via Swagger UI at `/api-docs` when the server is running.

## Getting Started

### Prerequisites
- Node.js (v16+)
- MySQL (v8+)

### Installation

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

## License

This project is licensed under the ISC License.
