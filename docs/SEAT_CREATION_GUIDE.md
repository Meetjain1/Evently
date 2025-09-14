# Creating Seats Guide

This guide explains how to create seats for venues and events in both single and bulk formats.

## 1. Single Seat Creation

Use this method to create one seat at a time.

**Endpoint:** `POST /api/seats`

**Request Body Format:**
```json
{
  "rowName": "A",              // Required: Row identifier
  "seatNumber": 1,             // Required: Seat number within the row
  "venueId": "venue-uuid",     // Required: UUID of the venue
  "eventId": "event-uuid",     // Optional: UUID of the event (if seat is for a specific event)
  "status": "available",       // Optional: Seat status (default: "available")
  "isActive": true,            // Optional: Whether the seat is active (default: true)
  "isAccessible": false,       // Optional: Whether the seat is accessible (default: false)
  "section": "Main Floor",     // Optional: Section identifier
  "notes": "Near the stage"    // Optional: Additional notes about the seat
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/seats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "rowName": "A",
    "seatNumber": 1,
    "venueId": "6f8c5c0e-913e-11f0-a14a-fc1d9bb2aa3c",
    "status": "available",
    "section": "Main Floor"
  }'
```

## 2. Bulk Seat Creation

Use this method to create multiple seats at once, by specifying a range of rows and number of seats per row.

**Endpoint:** `POST /api/seats`

**Request Body Format:**
```json
{
  "startRow": "A",             // Required: Starting row identifier
  "endRow": "C",               // Required: Ending row identifier (inclusive)
  "seatsPerRow": 10,           // Required: Number of seats in each row
  "venueId": "venue-uuid",     // Required: UUID of the venue
  "eventId": "event-uuid",     // Optional: UUID of the event (if seats are for a specific event)
  "status": "available",       // Optional: Seat status (default: "available")
  "isActive": true,            // Optional: Whether the seats are active (default: true)
  "isAccessible": false,       // Optional: Whether the seats are accessible (default: false)
  "section": "Main Floor"      // Optional: Section identifier
}
```

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/seats \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "startRow": "A",
    "endRow": "C",
    "seatsPerRow": 10,
    "venueId": "6f8c5c0e-913e-11f0-a14a-fc1d9bb2aa3c",
    "status": "available",
    "section": "Main Floor"
  }'
```

This will create:
- 10 seats in row A (A1, A2, ..., A10)
- 10 seats in row B (B1, B2, ..., B10)
- 10 seats in row C (C1, C2, ..., C10)

Total: 30 seats

## Important Notes

1. **Row Naming**: The system supports alphabetical row naming (A-Z) and will create seats in sequence. If you need numerical row names, use strings like "1", "2", etc.

2. **Seat Status**: Available options are:
   - `available`: Seat is available for booking
   - `booked`: Seat has been booked by a customer
   - `reserved`: Seat is temporarily reserved
   - `blocked`: Seat is blocked and cannot be booked
   - `maintenance`: Seat is unavailable due to maintenance

3. **Event-Specific Seats**: If you're creating seats for a specific event, include the `eventId`. Otherwise, the seats will be venue-wide and available for any event at that venue.

4. **Field Naming**: The API expects `rowName` (not `row`) for single seat creation. Make sure to use the correct field name.

## Examples

### Example 1: Creating a Single VIP Seat

```json
{
  "rowName": "VIP",
  "seatNumber": 1,
  "venueId": "6f8c5c0e-913e-11f0-a14a-fc1d9bb2aa3c",
  "status": "available",
  "section": "VIP Section",
  "isAccessible": true,
  "notes": "Premium seat with extra legroom"
}
```

### Example 2: Creating Multiple Rows of Balcony Seats

```json
{
  "startRow": "AA",
  "endRow": "CC",
  "seatsPerRow": 15,
  "venueId": "6f8c5c0e-913e-11f0-a14a-fc1d9bb2aa3c",
  "status": "available",
  "section": "Balcony"
}
```

### Example 3: Creating Event-Specific Seats

```json
{
  "startRow": "A",
  "endRow": "E",
  "seatsPerRow": 20,
  "venueId": "6f8c5c0e-913e-11f0-a14a-fc1d9bb2aa3c",
  "eventId": "a9eb6c28-913e-11f0-a14a-fc1d9bb2aa3c",
  "status": "available",
  "section": "Main Floor"
}
```
