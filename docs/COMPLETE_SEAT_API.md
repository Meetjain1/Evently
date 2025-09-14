# Complete Seat Management API Documentation

This document provides comprehensive documentation for all seat-related API endpoints in the Evently system.

## Table of Contents
1. [Create Seats](#1-create-seats)
2. [Get Seats for a Venue](#2-get-seats-for-a-venue)
3. [Get Seats for an Event](#3-get-seats-for-an-event)
4. [Get Seat by ID](#4-get-seat-by-id)
5. [Update Seat](#5-update-seat)
6. [Delete Seat](#6-delete-seat)
7. [Get Seats Availability for an Event](#7-get-seats-availability-for-an-event)
8. [Troubleshooting](#troubleshooting)

---

## 1. Create Seats

### Smart Seat Creation Endpoint

**Endpoint**: `POST /api/seats/venue/:venueId`  
**Authentication**: Admin only

This endpoint supports both single seat and bulk seat creation based on the request body format.

### Single Seat Format

```json
{
  "row": "A",
  "seatNumber": 1,
  "notes": "Optional seat note",
  "isAccessible": false,
  "eventId": null
}
```

**Required Fields**:
- `row`: String (max 10 chars)
- `seatNumber`: Integer (min 1)

**Optional Fields**:
- `status`: String (one of: "available", "reserved", "booked")
- `isActive`: Boolean
- `notes`: String
- `eventId`: UUID or null
- `isAccessible`: Boolean

### Bulk Creation Format

```json
{
  "startRow": "A",
  "endRow": "C",
  "seatsPerRow": 10,
  "section": "Orchestra",
  "isAccessible": false,
  "notes": "Standard seats",
  "eventId": null
}
```

**Required Fields**:
- `startRow`: String (max 10 chars)
- `endRow`: String (max 10 chars)
- `seatsPerRow`: Integer (min 1)

**Optional Fields**:
- `section`: String
- `isAccessible`: Boolean
- `notes`: String
- `eventId`: UUID or null

### Response

#### Success (201 Created)
```json
{
  "count": 15,
  "seats": [
    {
      "id": "uuid-1",
      "rowName": "A",
      "seatNumber": 1,
      "status": "available",
      "isActive": true,
      "notes": "Standard seats",
      "isAccessible": false,
      "venueId": "venue-id",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // ... more seats
  ]
}
```

#### Error
- 400 Bad Request - Invalid input data
- 401 Unauthorized - Missing or invalid authentication
- 403 Forbidden - User doesn't have permission
- 404 Not Found - Venue not found
- 409 Conflict - Seat already exists

---

## 2. Get Seats for a Venue

**Endpoint**: `GET /api/seats/venue/:venueId`  
**Authentication**: Public

Retrieves all seats for a specified venue with optional filtering, pagination, and sorting.

### Query Parameters

- `row` (optional): Filter by row name
- `seatNumber` (optional): Filter by seat number
- `section` (optional): Filter by section
- `isAccessible` (optional): Filter for accessible seats (true/false)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 100, max: 500)
- `sort` (optional): Field to sort by ('row', 'seatNumber')
- `order` (optional): Sort order ('ASC', 'DESC')

### Response

#### Success (200 OK)
```json
{
  "data": [
    {
      "id": "uuid-1",
      "rowName": "A",
      "seatNumber": 1,
      "status": "available",
      "isActive": true,
      "notes": "Standard seats",
      "isAccessible": false,
      "venueId": "venue-id",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // ... more seats
  ],
  "meta": {
    "page": 1,
    "limit": 100,
    "total": 150,
    "totalPages": 2
  }
}
```

#### Error
- 404 Not Found - Venue not found

---

## 3. Get Seats for an Event

**Endpoint**: `GET /api/events/:eventId/seats`  
**Authentication**: Public

Retrieves all seats for a specified event with their availability status.

### Query Parameters

- `status` (optional): Filter by seat status ('available', 'reserved', 'booked')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 100, max: 500)

### Response

#### Success (200 OK)
```json
{
  "data": [
    {
      "id": "uuid-1",
      "rowName": "A",
      "seatNumber": 1,
      "status": "available",
      "isActive": true,
      "notes": "Standard seats",
      "isAccessible": false,
      "venueId": "venue-id",
      "eventId": "event-id",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // ... more seats
  ],
  "meta": {
    "page": 1,
    "limit": 100,
    "total": 150,
    "totalPages": 2
  }
}
```

#### Error
- 404 Not Found - Event not found or has no seats

---

## 4. Get Seat by ID

**Endpoint**: `GET /api/seats/:id`  
**Authentication**: Public

Retrieves details for a single seat by its ID.

### Response

#### Success (200 OK)
```json
{
  "id": "uuid-1",
  "rowName": "A",
  "seatNumber": 1,
  "status": "available",
  "isActive": true,
  "notes": "Standard seats",
  "isAccessible": false,
  "venueId": "venue-id",
  "eventId": "event-id",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Error
- 404 Not Found - Seat not found

---

## 5. Update Seat

**Endpoint**: `PUT /api/seats/:id`  
**Authentication**: Admin only

Updates an existing seat.

### Request Body

```json
{
  "row": "B",
  "seatNumber": 5,
  "status": "reserved",
  "isActive": true,
  "notes": "Updated seat note",
  "isAccessible": true
}
```

**Optional Fields** (include only fields to update):
- `row`: String (max 10 chars)
- `seatNumber`: Integer (min 1)
- `status`: String (one of: "available", "reserved", "booked")
- `isActive`: Boolean
- `notes`: String
- `isAccessible`: Boolean

### Response

#### Success (200 OK)
```json
{
  "id": "uuid-1",
  "rowName": "B",
  "seatNumber": 5,
  "status": "reserved",
  "isActive": true,
  "notes": "Updated seat note",
  "isAccessible": true,
  "venueId": "venue-id",
  "createdAt": "2023-01-01T00:00:00.000Z",
  "updatedAt": "2023-01-01T00:00:00.000Z"
}
```

#### Error
- 400 Bad Request - Invalid input data
- 401 Unauthorized - Missing or invalid authentication
- 403 Forbidden - User doesn't have permission
- 404 Not Found - Seat not found
- 409 Conflict - Update would create a duplicate seat

---

## 6. Delete Seat

**Endpoint**: `DELETE /api/seats/:id`  
**Authentication**: Admin only

Deletes a seat.

### Response

#### Success (204 No Content)
No response body

#### Error
- 401 Unauthorized - Missing or invalid authentication
- 403 Forbidden - User doesn't have permission
- 404 Not Found - Seat not found

---

## 7. Get Seats Availability for an Event

**Endpoint**: `GET /api/seats/availability/:eventId`  
**Authentication**: Public

Retrieves the availability status of all seats for a specified event.

### Response

#### Success (200 OK)
```json
{
  "total": 100,
  "available": 75,
  "reserved": 15,
  "booked": 10
}
```

#### Error
- 404 Not Found - Event not found

---

## Troubleshooting

### Common Issues

#### 1. 404 Not Found for Event Seats
- Ensure the event exists
- Check if the event has seats assigned to it
- Verify that the event has seating enabled (`hasSeating: true`)
- Make sure seats have been created specifically for this event or for the venue associated with the event

#### 2. Unable to Create Seats
- Verify you have admin permissions
- Ensure the venue exists
- Check that the venue has seating enabled (`hasSeating: true`)
- For bulk creation, make sure `startRow` comes before `endRow` alphabetically
- Check for existing seats with the same row and seat number

#### 3. Validation Errors
- Double-check all required fields are provided
- Ensure field values match the expected types and constraints
- For bulk creation, use `startRow`, `endRow`, and `seatsPerRow`
- For single seat creation, use `row` and `seatNumber`

### Testing Steps

1. Create a venue with seating enabled
2. Create seats for the venue
3. Create an event associated with the venue (with `hasSeating: true`)
4. Check seat availability for the event
5. Try booking or reserving seats for the event

### Example API Flow

#### 1. Create a Venue
```json
POST /api/venues
{
  "name": "Test Venue",
  "address": "123 Main St",
  "city": "Metropolis",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA",
  "totalCapacity": 300,
  "hasSeating": true,
  "description": "Test venue with assigned seating"
}
```

#### 2. Create Seats for the Venue
```json
POST /api/seats/venue/{venueId}
{
  "startRow": "A",
  "endRow": "C",
  "seatsPerRow": 5
}
```

#### 3. Create an Event
```json
POST /api/events
{
  "title": "Test Event",
  "description": "A test event with seating",
  "startDate": "2025-10-01T18:00:00.000Z",
  "endDate": "2025-10-01T22:00:00.000Z",
  "venueId": "{venueId}",
  "hasSeating": true,
  "ticketPrice": 25.00,
  "capacity": 15
}
```

#### 4. Get Seats for the Event
```
GET /api/events/{eventId}/seats
```

#### 5. Check Seat Availability
```
GET /api/seats/availability/{eventId}
```
