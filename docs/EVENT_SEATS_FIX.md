# Event Seats API Update

## Event Seats Endpoint Fixed

I've fixed the missing event seats endpoint. You can now successfully get seats for an event using the following endpoint:

```
GET /api/events/{eventId}/seats
```

### Query Parameters

- `status` (optional): Filter by seat status ('available', 'reserved', 'booked')
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 100)

### Example Request

```
GET /api/events/08ea5992-b2b4-4546-bec4-e993e4c8d1c4/seats?status=available&page=1&limit=50
```

### Example Response

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
      "eventId": "08ea5992-b2b4-4546-bec4-e993e4c8d1c4",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    },
    // More seats...
  ],
  "meta": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3
  }
}
```

### What Was Fixed

1. The endpoint `GET /api/events/{eventId}/seats` was defined in the Swagger documentation but was not actually implemented in the codebase.
2. I've added the missing implementation:
   - Created a new controller method `getSeatsForEvent` in `SeatController`
   - Added a helper method `getEventById` in `SeatService`
   - Connected the new endpoint in `event.routes.ts`

### Potential Issues to Watch For

1. **404 Errors**:
   - Make sure the event exists
   - Make sure the venue associated with the event exists
   - Make sure the venue has seats assigned

2. **No Seats Returned**:
   - Seats might be associated with the venue but not specifically with the event
   - The event might not have `hasSeating` set to `true`

### Required Flow to Make Seats Work with Events

1. Create a venue with `hasSeating: true`
2. Create seats for the venue
3. Create an event for that venue with `hasSeating: true`
4. Optionally assign specific seats to the event (by setting the `eventId` field on seats)

Try the endpoint now and it should work properly!
