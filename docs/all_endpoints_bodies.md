# All Endpoints — Corrected Request Bodies

> This document provides corrected request body examples that exactly match the backend validation requirements for each API endpoint in the Evently application.

---

## 1) POST /api/auth/register

* **Purpose**: Register a new user account
* **Backend required fields**: `firstName` (string, 2-100 chars), `lastName` (string, 2-100 chars), `email` (string, valid email), `password` (string, min 8 chars)
* **Optional fields**: `role` (enum: "user", "admin", "organizer" - defaults to "user")
* **Current swagger example**: No example provided in schema
* **Corrected example (copy-paste into Swagger Try it out)**:

```json
{
  "firstName": "Meet",
  "lastName": "Jain",
  "email": "meet.jain@example.com",
  "password": "StrongPass123",
  "role": "user"
}
```

* **Notes**: Password must be at least 8 characters. Role is optional and defaults to "user" if not provided.

---

## 2) POST /api/auth/login

* **Purpose**: Authenticate user and get JWT token
* **Backend required fields**: `email` (string, valid email), `password` (string, required)
* **Current swagger example**: No example provided in schema
* **Corrected example (copy-paste into Swagger Try it out)**:

```json
{
  "email": "meet.jain@example.com",
  "password": "StrongPass123"
}
```

* **Notes**: Returns JWT token and user info on successful authentication.

---

## 3) POST /api/auth/change-password

* **Purpose**: Change user password (requires authentication)
* **Backend required fields**: `currentPassword` (string), `newPassword` (string, min 8 chars), `confirmPassword` (string, must match newPassword)
* **Corrected example**:

```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewStrongPass456",
  "confirmPassword": "NewStrongPass456"
}
```

* **Notes**: Requires valid Bearer token. Passwords must match exactly.

---

## 4) POST /api/auth/forgot-password

* **Purpose**: Request password reset email
* **Backend required fields**: `email` (string, valid email)
* **Corrected example**:

```json
{
  "email": "meet.jain@example.com"
}
```

---

## 5) POST /api/auth/reset-password

* **Purpose**: Reset password with reset token
* **Backend required fields**: `password` (string, min 8 chars), `confirmPassword` (string, must match password)
* **Corrected example**:

```json
{
  "password": "NewSecurePass789",
  "confirmPassword": "NewSecurePass789"
}
```

* **Notes**: Reset token must be provided in URL parameters or headers.

---

## 6) POST /api/events

* **Purpose**: Create a new event
* **Backend required fields**: `name` (string, 3-100 chars), `description` (string), `startDate` (ISO date, future), `endDate` (ISO date, after startDate), `capacity` (integer, min 1), `ticketPrice` (number, min 0), `venueId` (UUID string)
* **Optional fields**: `isFeatured` (boolean, default false), `status` (enum, default "draft"), `hasWaitlist` (boolean, default false), `maxWaitlistSize` (integer, default 0), `hasSeating` (boolean, default false)
* **Current swagger issue**: Missing example, venueId not specified as UUID format
* **Corrected example (copy-paste into Swagger Try it out)**:

```json
{
  "name": "Tech Conference 2025",
  "description": "Annual technology conference featuring the latest innovations and industry trends.",
  "startDate": "2025-12-15T09:00:00.000Z",
  "endDate": "2025-12-15T18:00:00.000Z",
  "venueId": "550e8400-e29b-41d4-a716-446655440000",
  "capacity": 500,
  "ticketPrice": 149.99,
  "hasWaitlist": true,
  "maxWaitlistSize": 100,
  "hasSeating": false,
  "isFeatured": true,
  "status": "draft"
}
```

* **Notes**: Requires Bearer token. venueId must be a valid UUID. startDate must be in the future, endDate must be after startDate.

---

## 7) PUT /api/events/{id}

* **Purpose**: Update an existing event
* **Backend fields**: All fields from create event are optional for updates
* **Corrected example**:

```json
{
  "name": "Updated Tech Conference 2025",
  "ticketPrice": 159.99,
  "status": "published",
  "isFeatured": false
}
```

* **Notes**: Only provide fields you want to update. Date validation still applies if updating dates.

---

## 8) POST /api/venues

* **Purpose**: Create a new venue
* **Backend required fields**: `name` (string, 3-100 chars), `address` (string, 5-200 chars), `city` (string, 2-100 chars), `state` (string, 2-100 chars), `zipCode` (string, 5-20 chars), `country` (string, 2-100 chars), `totalCapacity` (integer, min 1)
* **Optional fields**: `hasSeating` (boolean, default false), `description` (string, nullable)
* **Current swagger issue**: Missing example
* **Corrected example (copy-paste into Swagger Try it out)**:

```json
{
  "name": "Grand Convention Center",
  "address": "123 Main Street",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "zipCode": "452001",
  "country": "India",
  "totalCapacity": 1500,
  "hasSeating": true,
  "description": "A modern convention center with state-of-the-art facilities and flexible seating arrangements."
}
```

* **Notes**: Requires Bearer token. All address fields are required with specific length constraints.

---

## 9) POST /api/bookings

* **Purpose**: Create a new booking for an event
* **Backend required fields**: `eventId` (UUID string), `numberOfTickets` (integer, min 1)
* **Optional fields**: `seatIds` (array of UUID strings - required for events with assigned seating)
* **Current swagger issue**: Missing specific UUID format requirement, missing example
* **Corrected example (copy-paste into Swagger Try it out)**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfTickets": 2,
  "seatIds": [
    "660e8400-e29b-41d4-a716-446655440001",
    "660e8400-e29b-41d4-a716-446655440002"
  ]
}
```

* **Notes**: Requires Bearer token. eventId must be valid UUID. seatIds only required for events with hasSeating=true.

---

## 10) POST /api/waitlist

* **Purpose**: Join event waitlist when event is fully booked
* **Backend required fields**: `eventId` (UUID string), `numberOfTickets` (integer, min 1)
* **Current swagger issue**: Missing UUID format specification and example
* **Corrected example (copy-paste into Swagger Try it out)**:

```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfTickets": 3
}
```

* **Notes**: Requires Bearer token. eventId must be valid UUID. Only works when event is fully booked and has waitlist enabled.

---

## 11) POST /api/seats

* **Purpose**: Create seats for a venue (bulk creation)
* **Backend fields**: Based on seat validation schema
* **Corrected example**:

```json
{
  "venueId": "550e8400-e29b-41d4-a716-446655440000",
  "seats": [
    {
      "seatNumber": "A1",
      "row": "A",
      "section": "VIP",
      "isAvailable": true
    },
    {
      "seatNumber": "A2", 
      "row": "A",
      "section": "VIP",
      "isAvailable": true
    }
  ]
}
```

* **Notes**: Requires Bearer token. Creates multiple seats for a venue.

---

## Authentication Requirements

All endpoints except the following require a valid Bearer token in the Authorization header:
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/events` (public read access)
- `GET /api/venues` (public read access)

### Authorization Header Format:
```
Authorization: Bearer <your-jwt-token-here>
```

---

## Common Data Formats

### UUID Format
All ID fields (eventId, venueId, seatIds, etc.) must follow UUID v4 format:
```
550e8400-e29b-41d4-a716-446655440000
```

### Date Format
All dates must be in ISO 8601 format with timezone:
```
2025-12-15T09:00:00.000Z
```

### Email Format
Must be valid email address:
```
user@example.com
```

---

## Status Enums

### Event Status
- `draft`
- `published` 
- `cancelled`
- `completed`

### Booking Status  
- `pending`
- `confirmed`
- `cancelled`

### Waitlist Status
- `waiting`
- `notified`
- `expired`
- `converted`

### User Roles
- `user`
- `admin`
- `organizer`