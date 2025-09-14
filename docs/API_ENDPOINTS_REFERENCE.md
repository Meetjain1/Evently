# API Endpoints Reference

This document provides a comprehensive reference of all API endpoints in the Evently application.

## Base URL

All endpoints are relative to the base URL:

```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the `Authorization` header:

```
Authorization: Bearer <your_token>
```

## Response Format

All API responses follow a consistent format:

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

For errors:

```json
{
  "success": false,
  "message": "Error message here"
}
```

## Pagination

List endpoints support pagination with the following query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sort`: Field to sort by
- `order`: Sort order ('ASC' or 'DESC')

Paginated response format:

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 10
  }
}
```

## Authentication Endpoints

### Register User

```
POST /auth/register
```

Create a new user account.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

### Login

```
POST /auth/login
```

Authenticate a user and get a JWT token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user"
    }
  }
}
```

## User Endpoints

### Get Current User

```
GET /users/me
```

Get the currently authenticated user's profile.

**Authentication:** Required

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Update User Profile

```
PUT /users/me
```

Update the current user's profile information.

**Authentication:** Required

**Request Body:**

```json
{
  "firstName": "Updated",
  "lastName": "Name"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    "role": "user",
    "createdAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Change Password

```
PUT /users/me/password
```

Change the current user's password.

**Authentication:** Required

**Request Body:**

```json
{
  "currentPassword": "currentPassword123",
  "newPassword": "newPassword123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

## Venue Endpoints

### List Venues

```
GET /venues
```

Get a paginated list of venues.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Field to sort by (default: 'name')
- `order` (optional): Sort order - 'ASC' or 'DESC' (default: 'ASC')
- `city` (optional): Filter by city
- `state` (optional): Filter by state

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "name": "Conference Center",
        "address": "123 Main St",
        "city": "New York",
        "state": "NY",
        "zipCode": "10001",
        "capacity": 500,
        "description": "A modern conference center in downtown"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Get Venue Details

```
GET /venues/:id
```

Get details of a specific venue.

**Authentication:** Required

**Parameters:**
- `id`: Venue ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Conference Center",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "capacity": 500,
    "description": "A modern conference center in downtown",
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Create Venue

```
POST /venues
```

Create a new venue.

**Authentication:** Required
**Authorization:** Admin role required

**Request Body:**

```json
{
  "name": "Conference Center",
  "address": "123 Main St",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "capacity": 500,
  "description": "A modern conference center in downtown"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Conference Center",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "capacity": 500,
    "description": "A modern conference center in downtown",
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Update Venue

```
PUT /venues/:id
```

Update an existing venue.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: Venue ID

**Request Body:**

```json
{
  "name": "Updated Conference Center",
  "capacity": 600
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Updated Conference Center",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "capacity": 600,
    "description": "A modern conference center in downtown",
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T11:45:00.000Z"
  }
}
```

### Delete Venue

```
DELETE /venues/:id
```

Delete a venue.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: Venue ID

**Response:**

```json
{
  "success": true,
  "message": "Venue deleted successfully"
}
```

## Event Endpoints

### List Events

```
GET /events
```

Get a paginated list of events.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Field to sort by (default: 'startDate')
- `order` (optional): Sort order - 'ASC' or 'DESC' (default: 'ASC')
- `venueId` (optional): Filter by venue ID
- `startDate` (optional): Filter by start date (ISO format)
- `endDate` (optional): Filter by end date (ISO format)
- `isPublished` (optional): Filter by published status

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Annual Conference 2023",
        "description": "Join us for our annual tech conference",
        "startDate": "2023-10-15T09:00:00.000Z",
        "endDate": "2023-10-17T17:00:00.000Z",
        "venue": {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Conference Center"
        },
        "capacity": 300,
        "bookedSeats": 150,
        "ticketPrice": 99.99,
        "isPublished": true
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Get Event Details

```
GET /events/:id
```

Get details of a specific event.

**Authentication:** Required

**Parameters:**
- `id`: Event ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Annual Conference 2023",
    "description": "Join us for our annual tech conference",
    "startDate": "2023-10-15T09:00:00.000Z",
    "endDate": "2023-10-17T17:00:00.000Z",
    "venue": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Conference Center",
      "address": "123 Main St",
      "city": "New York",
      "state": "NY"
    },
    "creator": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "firstName": "Admin",
      "lastName": "User"
    },
    "capacity": 300,
    "bookedSeats": 150,
    "ticketPrice": 99.99,
    "isPublished": true,
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Create Event

```
POST /events
```

Create a new event.

**Authentication:** Required
**Authorization:** Admin role required

**Request Body:**

```json
{
  "title": "Annual Conference 2023",
  "description": "Join us for our annual tech conference",
  "startDate": "2023-10-15T09:00:00Z",
  "endDate": "2023-10-17T17:00:00Z",
  "venueId": "123e4567-e89b-12d3-a456-426614174000",
  "capacity": 300,
  "ticketPrice": 99.99,
  "isPublished": true
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Annual Conference 2023",
    "description": "Join us for our annual tech conference",
    "startDate": "2023-10-15T09:00:00.000Z",
    "endDate": "2023-10-17T17:00:00.000Z",
    "venueId": "123e4567-e89b-12d3-a456-426614174000",
    "creatorId": "123e4567-e89b-12d3-a456-426614174001",
    "capacity": 300,
    "bookedSeats": 0,
    "ticketPrice": 99.99,
    "isPublished": true,
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Update Event

```
PUT /events/:id
```

Update an existing event.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: Event ID

**Request Body:**

```json
{
  "title": "Updated Conference 2023",
  "ticketPrice": 129.99
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "title": "Updated Conference 2023",
    "description": "Join us for our annual tech conference",
    "startDate": "2023-10-15T09:00:00.000Z",
    "endDate": "2023-10-17T17:00:00.000Z",
    "venueId": "123e4567-e89b-12d3-a456-426614174000",
    "creatorId": "123e4567-e89b-12d3-a456-426614174001",
    "capacity": 300,
    "bookedSeats": 0,
    "ticketPrice": 129.99,
    "isPublished": true,
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T11:45:00.000Z"
  }
}
```

### Delete Event

```
DELETE /events/:id
```

Delete an event.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: Event ID

**Response:**

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

### Publish Event

```
PUT /events/:id/publish
```

Publish an event, making it visible to all users.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: Event ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "isPublished": true,
    "updatedAt": "2023-09-15T11:45:00.000Z"
  }
}
```

### Unpublish Event

```
PUT /events/:id/unpublish
```

Unpublish an event, hiding it from users.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: Event ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "isPublished": false,
    "updatedAt": "2023-09-15T11:45:00.000Z"
  }
}
```

## Seat Endpoints

### Get Seats for Event

```
GET /events/:eventId/seats
```

Get all seats for a specific event.

**Authentication:** Required

**Parameters:**
- `eventId`: Event ID

**Query Parameters:**
- `status` (optional): Filter by seat status ('available', 'reserved', 'booked')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Field to sort by (default: 'rowName')
- `order` (optional): Sort order - 'ASC' or 'DESC' (default: 'ASC')

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "row": "A",
        "number": 1,
        "price": 149.99,
        "status": "available",
        "eventId": "123e4567-e89b-12d3-a456-426614174001"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Get Seat Details

```
GET /seats/:id
```

Get details of a specific seat.

**Authentication:** Required

**Parameters:**
- `id`: Seat ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "row": "A",
    "number": 1,
    "price": 149.99,
    "status": "available",
    "event": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "title": "Annual Conference 2023"
    },
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Create Seat

```
POST /seats
```

Create a new seat.

**Authentication:** Required
**Authorization:** Admin role required

**Request Body:**

```json
{
  "eventId": "123e4567-e89b-12d3-a456-426614174001",
  "row": "A",
  "number": 1,
  "price": 149.99,
  "status": "available"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "row": "A",
    "number": 1,
    "price": 149.99,
    "status": "available",
    "eventId": "123e4567-e89b-12d3-a456-426614174001",
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Update Seat

```
PUT /seats/:id
```

Update an existing seat.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: Seat ID

**Request Body:**

```json
{
  "price": 179.99,
  "status": "reserved"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "row": "A",
    "number": 1,
    "price": 179.99,
    "status": "reserved",
    "eventId": "123e4567-e89b-12d3-a456-426614174001",
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T11:45:00.000Z"
  }
}
```

### Delete Seat

```
DELETE /seats/:id
```

Delete a seat.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: Seat ID

**Response:**

```json
{
  "success": true,
  "message": "Seat deleted successfully"
}
```

### Bulk Create Seats

```
POST /events/:eventId/seats/bulk
```

Create multiple seats for an event at once.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `eventId`: Event ID

**Request Body:**

```json
{
  "rows": ["A", "B", "C"],
  "seatsPerRow": 10,
  "basePrice": 149.99
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "created": 30,
    "message": "30 seats created successfully"
  }
}
```

## Booking Endpoints

### List User Bookings

```
GET /bookings
```

Get all bookings for the current user.

**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Field to sort by (default: 'createdAt')
- `order` (optional): Sort order - 'ASC' or 'DESC' (default: 'DESC')
- `status` (optional): Filter by booking status ('pending', 'confirmed', 'canceled')

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "event": {
          "id": "123e4567-e89b-12d3-a456-426614174001",
          "title": "Annual Conference 2023",
          "startDate": "2023-10-15T09:00:00.000Z"
        },
        "seat": {
          "id": "123e4567-e89b-12d3-a456-426614174002",
          "row": "A",
          "number": 1
        },
        "status": "confirmed",
        "createdAt": "2023-09-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Get Booking Details

```
GET /bookings/:id
```

Get details of a specific booking.

**Authentication:** Required

**Parameters:**
- `id`: Booking ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174003",
      "firstName": "John",
      "lastName": "Doe"
    },
    "event": {
      "id": "123e4567-e89b-12d3-a456-426614174001",
      "title": "Annual Conference 2023",
      "startDate": "2023-10-15T09:00:00.000Z",
      "endDate": "2023-10-17T17:00:00.000Z",
      "venue": {
        "name": "Conference Center",
        "address": "123 Main St",
        "city": "New York"
      }
    },
    "seat": {
      "id": "123e4567-e89b-12d3-a456-426614174002",
      "row": "A",
      "number": 1,
      "price": 149.99
    },
    "status": "confirmed",
    "paymentMethod": "credit_card",
    "paymentId": "pi_3Kj9s2B5JOGz8HVj0Xr4BhCx",
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Create Booking

```
POST /bookings
```

Create a new booking.

**Authentication:** Required

**Request Body:**

```json
{
  "eventId": "123e4567-e89b-12d3-a456-426614174001",
  "seatIds": [
    "123e4567-e89b-12d3-a456-426614174002"
  ],
  "paymentMethod": "credit_card",
  "paymentDetails": {
    "cardNumber": "4111111111111111",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "cvv": "123"
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "123e4567-e89b-12d3-a456-426614174003",
    "eventId": "123e4567-e89b-12d3-a456-426614174001",
    "seatId": "123e4567-e89b-12d3-a456-426614174002",
    "status": "confirmed",
    "paymentMethod": "credit_card",
    "paymentId": "pi_3Kj9s2B5JOGz8HVj0Xr4BhCx",
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Cancel Booking

```
PUT /bookings/:id/cancel
```

Cancel a booking.

**Authentication:** Required

**Parameters:**
- `id`: Booking ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "status": "canceled",
    "updatedAt": "2023-09-15T11:45:00.000Z"
  }
}
```

## Waitlist Endpoints

### Join Waitlist

```
POST /events/:eventId/waitlist
```

Add the current user to an event's waitlist.

**Authentication:** Required

**Parameters:**
- `eventId`: Event ID

**Request Body:**

```json
{
  "numberOfTickets": 2,
  "notificationEmail": "user@example.com"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "123e4567-e89b-12d3-a456-426614174003",
    "eventId": "123e4567-e89b-12d3-a456-426614174001",
    "numberOfTickets": 2,
    "position": 5,
    "notificationEmail": "user@example.com",
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z"
  }
}
```

### Check Waitlist Position

```
GET /events/:eventId/waitlist/position
```

Check the current user's position on an event's waitlist.

**Authentication:** Required

**Parameters:**
- `eventId`: Event ID

**Response:**

```json
{
  "success": true,
  "data": {
    "position": 5,
    "totalAhead": 4,
    "estimatedWaitTime": "2-3 days",
    "numberOfTickets": 2
  }
}
```

### Leave Waitlist

```
DELETE /events/:eventId/waitlist
```

Remove the current user from an event's waitlist.

**Authentication:** Required

**Parameters:**
- `eventId`: Event ID

**Response:**

```json
{
  "success": true,
  "message": "Successfully removed from waitlist"
}
```

### Get Waitlist (Admin Only)

```
GET /events/:eventId/waitlist
```

Get the full waitlist for an event.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `eventId`: Event ID

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "user": {
          "id": "123e4567-e89b-12d3-a456-426614174003",
          "firstName": "John",
          "lastName": "Doe",
          "email": "user@example.com"
        },
        "numberOfTickets": 2,
        "position": 1,
        "notificationEmail": "user@example.com",
        "createdAt": "2023-09-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

## Admin Endpoints

### Get All Users (Admin Only)

```
GET /admin/users
```

Get a paginated list of all users.

**Authentication:** Required
**Authorization:** Admin role required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Field to sort by (default: 'createdAt')
- `order` (optional): Sort order - 'ASC' or 'DESC' (default: 'DESC')
- `role` (optional): Filter by role ('admin', 'user')

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "email": "user@example.com",
        "firstName": "John",
        "lastName": "Doe",
        "role": "user",
        "createdAt": "2023-09-15T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

### Get User Details (Admin Only)

```
GET /admin/users/:id
```

Get detailed information about a specific user.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: User ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2023-09-15T10:30:00.000Z",
    "updatedAt": "2023-09-15T10:30:00.000Z",
    "bookings": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174001",
        "eventId": "123e4567-e89b-12d3-a456-426614174002",
        "status": "confirmed",
        "createdAt": "2023-09-15T10:30:00.000Z"
      }
    ]
  }
}
```

### Update User (Admin Only)

```
PUT /admin/users/:id
```

Update a user's information.

**Authentication:** Required
**Authorization:** Admin role required

**Parameters:**
- `id`: User ID

**Request Body:**

```json
{
  "firstName": "Updated",
  "lastName": "Name",
  "role": "admin"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "email": "user@example.com",
    "firstName": "Updated",
    "lastName": "Name",
    "role": "admin",
    "updatedAt": "2023-09-15T11:45:00.000Z"
  }
}
```

### Get Dashboard Stats (Admin Only)

```
GET /admin/stats
```

Get system-wide statistics for the admin dashboard.

**Authentication:** Required
**Authorization:** Admin role required

**Response:**

```json
{
  "success": true,
  "data": {
    "userStats": {
      "total": 150,
      "newThisMonth": 25
    },
    "eventStats": {
      "total": 20,
      "upcoming": 15,
      "past": 5
    },
    "bookingStats": {
      "total": 500,
      "confirmed": 450,
      "canceled": 50,
      "revenueTotal": 45000
    },
    "topEvents": [
      {
        "id": "123e4567-e89b-12d3-a456-426614174000",
        "title": "Annual Conference 2023",
        "bookings": 200,
        "revenue": 20000
      }
    ]
  }
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 400 | Bad Request - Invalid input parameters |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server-side error |

## Rate Limits

- Regular endpoints: 100 requests per 15 minutes per IP
- Authentication endpoints: 10 requests per hour per IP
