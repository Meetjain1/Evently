# Edge Cases — Request Body Test Scenarios

> This document contains test payloads for edge cases and validation scenarios. These can be used to verify proper error handling and validation in the API endpoints.

---

## Authentication Endpoints

### POST /api/auth/register

#### 1. Missing required field - firstName
* **Payload**:
```json
{
  "lastName": "Jain",
  "email": "meet.jain@example.com",
  "password": "StrongPass123"
}
```
* **Expected**: HTTP 400, message `firstName is required`
* **Rationale**: Ensure server returns clear validation message for missing required fields.

#### 2. Invalid email format
* **Payload**:
```json
{
  "firstName": "Meet",
  "lastName": "Jain", 
  "email": "not-an-email",
  "password": "StrongPass123"
}
```
* **Expected**: HTTP 400, message `email must be a valid email`

#### 3. Password too short
* **Payload**:
```json
{
  "firstName": "Meet",
  "lastName": "Jain",
  "email": "meet.jain@example.com",
  "password": "short"
}
```
* **Expected**: HTTP 400, message `password length must be at least 8 characters long`

#### 4. Invalid role value
* **Payload**:
```json
{
  "firstName": "Meet",
  "lastName": "Jain",
  "email": "meet.jain@example.com", 
  "password": "StrongPass123",
  "role": "superuser"
}
```
* **Expected**: HTTP 400, message `role must be one of [user, admin, organizer]`

#### 5. XSS attempt in name fields
* **Payload**:
```json
{
  "firstName": "<script>alert('XSS')</script>",
  "lastName": "Jain",
  "email": "test@example.com",
  "password": "StrongPass123"
}
```
* **Expected**: Proper sanitization or validation error
* **Rationale**: Test XSS protection in user input fields

#### 6. Duplicate email registration
* **Payload**:
```json
{
  "firstName": "Different",
  "lastName": "User",
  "email": "existing@example.com",
  "password": "StrongPass123"
}
```
* **Expected**: HTTP 409, message `Email already exists`

---

### POST /api/auth/login

#### 1. Missing password
* **Payload**:
```json
{
  "email": "meet.jain@example.com"
}
```
* **Expected**: HTTP 400, message `password is required`

#### 2. Empty string password
* **Payload**:
```json
{
  "email": "meet.jain@example.com",
  "password": ""
}
```
* **Expected**: HTTP 400, validation error for empty password

#### 3. Invalid credentials
* **Payload**:
```json
{
  "email": "meet.jain@example.com",
  "password": "WrongPassword"
}
```
* **Expected**: HTTP 401, message `Invalid credentials`

#### 4. Non-existent user
* **Payload**:
```json
{
  "email": "nonexistent@example.com",
  "password": "AnyPassword123"
}
```
* **Expected**: HTTP 401, message `Invalid credentials`

---

### POST /api/auth/change-password

#### 1. Passwords don't match
* **Payload**:
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword456",
  "confirmPassword": "DifferentPassword789"
}
```
* **Expected**: HTTP 400, message `Passwords do not match`

#### 2. Missing authorization header
* **Payload**:
```json
{
  "currentPassword": "OldPassword123", 
  "newPassword": "NewPassword456",
  "confirmPassword": "NewPassword456"
}
```
* **Expected**: HTTP 401, message `No token provided` (when no Authorization header)

#### 3. Wrong current password
* **Payload**:
```json
{
  "currentPassword": "WrongCurrentPassword",
  "newPassword": "NewPassword456", 
  "confirmPassword": "NewPassword456"
}
```
* **Expected**: HTTP 400, message `Current password is incorrect`

---

## Event Management Endpoints

### POST /api/events

#### 1. Missing required field - name
* **Payload**:
```json
{
  "description": "Event description",
  "startDate": "2025-12-15T09:00:00.000Z",
  "endDate": "2025-12-15T18:00:00.000Z", 
  "venueId": "550e8400-e29b-41d4-a716-446655440000",
  "capacity": 500,
  "ticketPrice": 149.99
}
```
* **Expected**: HTTP 400, message `name is required`

#### 2. Invalid date - startDate in past
* **Payload**:
```json
{
  "name": "Tech Conference 2025",
  "description": "Event description",
  "startDate": "2024-01-15T09:00:00.000Z",
  "endDate": "2025-12-15T18:00:00.000Z",
  "venueId": "550e8400-e29b-41d4-a716-446655440000", 
  "capacity": 500,
  "ticketPrice": 149.99
}
```
* **Expected**: HTTP 400, message `startDate must be greater than now`

#### 3. Invalid date - endDate before startDate
* **Payload**:
```json
{
  "name": "Tech Conference 2025",
  "description": "Event description", 
  "startDate": "2025-12-15T18:00:00.000Z",
  "endDate": "2025-12-15T09:00:00.000Z",
  "venueId": "550e8400-e29b-41d4-a716-446655440000",
  "capacity": 500,
  "ticketPrice": 149.99
}
```
* **Expected**: HTTP 400, message `endDate must be greater than startDate`

#### 4. Invalid UUID format for venueId
* **Payload**:
```json
{
  "name": "Tech Conference 2025",
  "description": "Event description",
  "startDate": "2025-12-15T09:00:00.000Z",
  "endDate": "2025-12-15T18:00:00.000Z",
  "venueId": "invalid-uuid",
  "capacity": 500,
  "ticketPrice": 149.99
}
```
* **Expected**: HTTP 400, message `venueId must be a valid GUID`

#### 5. Negative capacity
* **Payload**:
```json
{
  "name": "Tech Conference 2025",
  "description": "Event description",
  "startDate": "2025-12-15T09:00:00.000Z", 
  "endDate": "2025-12-15T18:00:00.000Z",
  "venueId": "550e8400-e29b-41d4-a716-446655440000",
  "capacity": -10,
  "ticketPrice": 149.99
}
```
* **Expected**: HTTP 400, message `capacity must be greater than or equal to 1`

#### 6. Negative ticket price
* **Payload**:
```json
{
  "name": "Tech Conference 2025",
  "description": "Event description",
  "startDate": "2025-12-15T09:00:00.000Z",
  "endDate": "2025-12-15T18:00:00.000Z",
  "venueId": "550e8400-e29b-41d4-a716-446655440000",
  "capacity": 500,
  "ticketPrice": -50.00
}
```
* **Expected**: HTTP 400, message `ticketPrice must be greater than or equal to 0`

#### 7. SQL Injection attempt in name
* **Payload**:
```json
{
  "name": "'; DROP TABLE events; --",
  "description": "Event description",
  "startDate": "2025-12-15T09:00:00.000Z",
  "endDate": "2025-12-15T18:00:00.000Z", 
  "venueId": "550e8400-e29b-41d4-a716-446655440000",
  "capacity": 500,
  "ticketPrice": 149.99
}
```
* **Expected**: Proper sanitization or validation error
* **Rationale**: Test SQL injection protection

#### 8. Very large payload
* **Payload**:
```json
{
  "name": "Tech Conference 2025",
  "description": "[10,000 character string]",
  "startDate": "2025-12-15T09:00:00.000Z",
  "endDate": "2025-12-15T18:00:00.000Z",
  "venueId": "550e8400-e29b-41d4-a716-446655440000",
  "capacity": 500,
  "ticketPrice": 149.99
}
```
* **Expected**: Proper handling of large descriptions or size limits
* **Rationale**: Test server's handling of large payloads

---

## Venue Management Endpoints

### POST /api/venues

#### 1. Missing required field - address
* **Payload**:
```json
{
  "name": "Grand Convention Center",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "zipCode": "452001",
  "country": "India",
  "totalCapacity": 1500
}
```
* **Expected**: HTTP 400, message `address is required`

#### 2. Address too short (less than 5 characters)
* **Payload**:
```json
{
  "name": "Grand Convention Center",
  "address": "123",
  "city": "Indore",
  "state": "Madhya Pradesh", 
  "zipCode": "452001",
  "country": "India",
  "totalCapacity": 1500
}
```
* **Expected**: HTTP 400, message `address length must be at least 5 characters long`

#### 3. Zero capacity
* **Payload**:
```json
{
  "name": "Grand Convention Center",
  "address": "123 Main Street",
  "city": "Indore",
  "state": "Madhya Pradesh",
  "zipCode": "452001", 
  "country": "India",
  "totalCapacity": 0
}
```
* **Expected**: HTTP 400, message `totalCapacity must be greater than or equal to 1`

---

## Booking Management Endpoints

### POST /api/bookings

#### 1. Invalid UUID for eventId
* **Payload**:
```json
{
  "eventId": "not-a-uuid",
  "numberOfTickets": 2
}
```
* **Expected**: HTTP 400, message `eventId must be a valid GUID`

#### 2. Zero tickets
* **Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfTickets": 0
}
```
* **Expected**: HTTP 400, message `numberOfTickets must be greater than or equal to 1`

#### 3. Invalid seatIds format
* **Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfTickets": 2,
  "seatIds": ["invalid-uuid-1", "invalid-uuid-2"]
}
```
* **Expected**: HTTP 400, validation error for seatIds format

#### 4. Mismatch between numberOfTickets and seatIds length
* **Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfTickets": 3,
  "seatIds": [
    "660e8400-e29b-41d4-a716-446655440001",
    "660e8400-e29b-41d4-a716-446655440002"
  ]
}
```
* **Expected**: HTTP 400, message about mismatch between ticket count and seat count

---

## Waitlist Endpoints

### POST /api/waitlist

#### 1. Invalid eventId format
* **Payload**:
```json
{
  "eventId": "invalid-event-id",
  "numberOfTickets": 2
}
```
* **Expected**: HTTP 400, message `eventId must be a valid GUID`

#### 2. Zero tickets requested
* **Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000", 
  "numberOfTickets": 0
}
```
* **Expected**: HTTP 400, message `numberOfTickets must be greater than or equal to 1`

#### 3. Event not fully booked
* **Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfTickets": 2
}
```
* **Expected**: HTTP 409, message `Event is not fully booked` (when event has available capacity)

---

## General Edge Cases

### 1. Missing Content-Type header
* **Test**: Send JSON payload without `Content-Type: application/json` header
* **Expected**: HTTP 400 or proper handling of content type

### 2. Malformed JSON
* **Payload**: `{"name": "Test", "invalid": json}`
* **Expected**: HTTP 400, JSON parsing error

### 3. Empty request body
* **Payload**: `{}`
* **Expected**: HTTP 400, validation errors for required fields

### 4. Extra unexpected fields
* **Payload**:
```json
{
  "email": "test@example.com",
  "password": "ValidPass123",
  "unexpectedField": "should be ignored",
  "anotherField": 12345
}
```
* **Expected**: Server should ignore extra fields or return validation error

### 5. Very large numbers
* **Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-446655440000",
  "numberOfTickets": 999999999999
}
```
* **Expected**: Proper handling of integer overflow or range validation

### 6. Unicode and special characters
* **Payload**:
```json
{
  "name": "Event with émojis 🎉 and ünïcödé",
  "description": "Testing unicode: αβγδε 中文 العربية"
}
```
* **Expected**: Proper unicode handling and storage

---

## Authentication & Authorization Edge Cases

### 1. Expired JWT token
* **Test**: Use expired token in Authorization header
* **Expected**: HTTP 401, message `Token expired`

### 2. Invalid JWT token
* **Test**: Use malformed token: `Bearer invalid.jwt.token`
* **Expected**: HTTP 401, message `Invalid token`

### 3. Insufficient permissions
* **Test**: User trying to access admin-only endpoints
* **Expected**: HTTP 403, message `Insufficient permissions`

### 4. No authorization header on protected endpoint
* **Test**: Access protected endpoint without Authorization header
* **Expected**: HTTP 401, message `No token provided`

---

## Rate Limiting Edge Cases

### 1. Rapid successive requests
* **Test**: Send 100 requests in quick succession
* **Expected**: HTTP 429 after rate limit exceeded

### 2. Different IP addresses
* **Test**: Verify rate limiting is per-IP or per-user
* **Expected**: Independent rate limits

---

## Database Constraint Edge Cases

### 1. Non-existent foreign key references
* **Payload**:
```json
{
  "eventId": "550e8400-e29b-41d4-a716-999999999999",
  "numberOfTickets": 2
}
```
* **Expected**: HTTP 404, message `Event not found`

### 2. Concurrent booking attempts
* **Test**: Multiple users trying to book last available tickets
* **Expected**: Proper handling of race conditions, only one booking succeeds

---

These edge cases help ensure robust error handling, proper validation, and security in the API implementation.