# Database Design Documentation

## Overview

This document outlines the database schema design for the Evently application, including table structures, relationships, indexes, and constraints.

## Entity-Relationship Diagram

```
┌───────────────────┐          ┌───────────────────┐
│      users        │          │      venues       │
├───────────────────┤          ├───────────────────┤
│ id (PK)           │          │ id (PK)           │
│ email             │◄────┐    │ name              │
│ firstName         │     │    │ address           │
│ lastName          │     │    │ city              │
│ password          │     │    │ state             │
│ role              │     │    │ zipCode           │
│ createdAt         │     │    │ capacity          │
│ updatedAt         │     │    │ description       │
└───────────────────┘     │    │ createdAt         │
                          │    │ updatedAt         │
                          │    └───────────────────┘
                          │            ▲
┌───────────────────┐     │            │
│      events       │     │            │
├───────────────────┤     │            │
│ id (PK)           │     │            │
│ title             │     │            │
│ description       │     │            │
│ startDate         │     │            │
│ endDate           │     │            │
│ venueId (FK)      │─────┘            │
│ creatorId (FK)    │─────────────────┘│
│ capacity          │                   │
│ bookedSeats       │                   │
│ ticketPrice       │                   │
│ isPublished       │                   │
│ createdAt         │                   │
│ updatedAt         │                   │
└───────────────────┘                   │
          ▲                             │
          │                             │
┌─────────┴───────┐                     │
│      seats      │                     │
├───────────────────┤                   │
│ id (PK)           │                   │
│ eventId (FK)      │───────────────────┘
│ row               │
│ number            │         ┌───────────────────┐
│ price             │         │     bookings      │
│ status            │◄────────├───────────────────┤
│ createdAt         │         │ id (PK)           │
│ updatedAt         │         │ userId (FK)       │
└───────────────────┘         │ eventId (FK)      │
                              │ seatId (FK)       │
                              │ status            │
                              │ paymentMethod     │
                              │ paymentId         │
                              │ createdAt         │
                              │ updatedAt         │
                              └───────────────────┘
```

## Table Definitions

### users

Stores user account information.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier for the user |
| email | VARCHAR(255) | UNIQUE, NOT NULL | User's email address |
| firstName | VARCHAR(255) | NOT NULL | User's first name |
| lastName | VARCHAR(255) | NOT NULL | User's last name |
| password | VARCHAR(255) | NOT NULL | Hashed password |
| role | ENUM | NOT NULL, DEFAULT 'user' | User role: 'user' or 'admin' |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- Primary Key: `id`
- Unique Index: `email`

### venues

Stores information about event venues.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier for the venue |
| name | VARCHAR(255) | NOT NULL | Venue name |
| address | VARCHAR(255) | NOT NULL | Street address |
| city | VARCHAR(100) | NOT NULL | City |
| state | VARCHAR(100) | NOT NULL | State/Province |
| zipCode | VARCHAR(20) | NOT NULL | Postal/ZIP code |
| capacity | INT | NOT NULL | Maximum venue capacity |
| description | TEXT | NULL | Detailed description |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- Primary Key: `id`
- Index: `name`
- Index: `city, state`

### events

Stores information about events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier for the event |
| title | VARCHAR(255) | NOT NULL | Event title |
| description | TEXT | NULL | Event description |
| startDate | TIMESTAMP | NOT NULL | Event start date and time |
| endDate | TIMESTAMP | NOT NULL | Event end date and time |
| venueId | UUID | FK, NOT NULL | Reference to venue |
| creatorId | UUID | FK, NOT NULL | Reference to user who created the event |
| capacity | INT | NOT NULL | Maximum number of attendees |
| bookedSeats | INT | NOT NULL, DEFAULT 0 | Current number of booked seats |
| ticketPrice | DECIMAL(10,2) | NOT NULL | Base ticket price |
| isPublished | BOOLEAN | NOT NULL, DEFAULT false | Whether the event is publicly visible |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- Primary Key: `id`
- Foreign Key: `venueId` references `venues(id)`
- Foreign Key: `creatorId` references `users(id)`
- Index: `startDate, endDate`
- Index: `isPublished`

### seats

Stores information about individual seats for events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier for the seat |
| eventId | UUID | FK, NOT NULL | Reference to the event |
| row | VARCHAR(10) | NOT NULL | Row identifier (e.g., "A", "B", "C") |
| number | INT | NOT NULL | Seat number within the row |
| price | DECIMAL(10,2) | NOT NULL | Seat price (may differ from base ticket price) |
| status | ENUM | NOT NULL, DEFAULT 'available' | Seat status: 'available', 'reserved', 'booked' |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- Primary Key: `id`
- Foreign Key: `eventId` references `events(id)`
- Unique Index: `eventId, row, number` (no duplicate seats)
- Index: `status`

### bookings

Stores information about ticket bookings.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier for the booking |
| userId | UUID | FK, NOT NULL | Reference to the user making the booking |
| eventId | UUID | FK, NOT NULL | Reference to the event |
| seatId | UUID | FK, NOT NULL | Reference to the seat |
| status | ENUM | NOT NULL | Booking status: 'pending', 'confirmed', 'canceled' |
| paymentMethod | VARCHAR(50) | NOT NULL | Payment method used |
| paymentId | VARCHAR(255) | NULL | External payment reference ID |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- Primary Key: `id`
- Foreign Key: `userId` references `users(id)`
- Foreign Key: `eventId` references `events(id)`
- Foreign Key: `seatId` references `seats(id)`
- Unique Index: `seatId` (a seat can only be booked once)
- Index: `userId, eventId`
- Index: `status`

### waitlist

Stores information about users on waitlists for events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, NOT NULL | Unique identifier for the waitlist entry |
| userId | UUID | FK, NOT NULL | Reference to the user |
| eventId | UUID | FK, NOT NULL | Reference to the event |
| numberOfTickets | INT | NOT NULL | Number of tickets requested |
| position | INT | NOT NULL | Position in the waitlist |
| notificationEmail | VARCHAR(255) | NOT NULL | Email to notify when tickets become available |
| createdAt | TIMESTAMP | NOT NULL | Record creation timestamp |
| updatedAt | TIMESTAMP | NOT NULL | Record update timestamp |

**Indexes:**
- Primary Key: `id`
- Foreign Key: `userId` references `users(id)`
- Foreign Key: `eventId` references `events(id)`
- Unique Index: `userId, eventId` (user can only be on waitlist once per event)
- Index: `eventId, position` (for ordering the waitlist)

## Database Migrations

Migrations are managed using TypeORM's migration system. The following migration files are available:

1. **1694689548000-InitialSchema.ts**: Creates the initial database schema with all tables and relationships.

To run migrations:

```bash
npm run migration:run
```

To generate a new migration after schema changes:

```bash
npm run migration:generate -- -n MigrationName
```

## Transactions and Concurrency

The application uses database transactions to ensure data consistency, especially for critical operations like seat booking:

1. **Optimistic Locking**: Events have a version counter to detect concurrent modifications.
2. **Seat Reservations**: Seats have a status transition flow (available → reserved → booked) with appropriate locking.

Example booking transaction flow:

```typescript
@Transaction()
async bookSeat(seatId: string, userId: string): Promise<Booking> {
  // Get seat with pessimistic lock
  const seat = await this.seatRepository.findOne({
    where: { id: seatId },
    lock: { mode: 'pessimistic_write' }
  });
  
  // Check if seat is available
  if (seat.status !== 'available') {
    throw new Error('Seat is not available');
  }
  
  // Update seat status
  seat.status = 'booked';
  await this.seatRepository.save(seat);
  
  // Update event booked seats count
  const event = await this.eventRepository.findOne({
    where: { id: seat.eventId }
  });
  event.bookedSeats += 1;
  await this.eventRepository.save(event);
  
  // Create booking record
  const booking = new Booking();
  booking.userId = userId;
  booking.eventId = seat.eventId;
  booking.seatId = seatId;
  booking.status = 'confirmed';
  // ... set other booking properties
  
  return this.bookingRepository.save(booking);
}
```

## Environment Variables

Database connection is configured using the following environment variables:

```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=evently
```

## Backup and Recovery

Recommended backup strategy:

1. **Daily Full Backups**: Complete database dump daily during off-peak hours.
2. **Hourly Incremental Backups**: Transaction log backups every hour.
3. **Point-in-Time Recovery**: Maintain transaction logs for detailed recovery if needed.

Example backup command:

```bash
mysqldump -u username -p evently > evently_backup_$(date +%Y%m%d).sql
```

Example restore command:

```bash
mysql -u username -p evently < evently_backup_20230101.sql
```
