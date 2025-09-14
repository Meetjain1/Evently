# API Endpoint Testing Guide

## 1. Event Seats API

The endpoint for getting seats by event ID is now working! You can use:

```
GET /api/events/{eventId}/seats
```

**Query Parameters**:
- `status` (optional): Filter by seat status (available, booked, reserved)
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `sort` (optional): Field to sort by (default: 'rowName')
- `order` (optional): Sort order - 'ASC' or 'DESC' (default: 'ASC')

**Example Request**:
```
GET /api/events/a9eb6c28-913e-11f0-a14a-fc1d9bb2aa3c/seats?status=available&page=1&limit=50
```

### Alternative Options

You can also access seats through these endpoints:

1. Get all seats (filter by eventId):
   ```
   GET /api/seats?eventId={eventId}
   ```

2. Get seats by venue (if you know the venue ID):
   ```
   GET /api/venues/{venueId}/seats
   ```

## 2. Waitlist API Endpoints

The Waitlist API provides endpoints for managing event waitlists.

### Create Waitlist Entry

```
POST /api/waitlist/events/{eventId}
```

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "numberOfTickets": 2
}
```

### Check Waitlist Position

```
GET /api/waitlist/events/{eventId}/position/{entryId}
```

### Get Waitlist Entries for an Event

```
GET /api/waitlist/events/{eventId}
```

### Process Waitlist (Admin)

```
POST /api/waitlist/events/{eventId}/process
```

## 3. Analytics API Endpoints

The Analytics API provides data insights for events and venues.

### Event Analytics

```
GET /api/analytics/events
```

Query parameters:
- `startDate` (optional): Filter events starting from this date
- `endDate` (optional): Filter events ending at this date
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

### Venue Analytics

```
GET /api/analytics/venues
```

Query parameters:
- `startDate` (optional): Filter by events at this venue starting from this date
- `endDate` (optional): Filter by events at this venue ending at this date
- `page` (optional): Page number for pagination (default: 1)
- `limit` (optional): Items per page (default: 10)

### Revenue Analytics

```
GET /api/analytics/revenue
```

Query parameters:
- `startDate` (optional): Filter revenue from this date
- `endDate` (optional): Filter revenue until this date
- `period` (optional): Group by 'day', 'week', 'month' (default: 'day')

### User Analytics (Admin Only)

```
GET /api/analytics/users
```

### Individual Event Analytics

```
GET /api/analytics/events/{eventId}
```

## Testing Notes

1. All endpoints except public ones require authentication
2. Admin endpoints require admin role
3. Most endpoints support pagination with `page` and `limit` query parameters
4. Dates should be in ISO format (YYYY-MM-DD or YYYY-MM-DDTHH:MM:SS.sssZ)
