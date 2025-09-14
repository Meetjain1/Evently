# Evently API Testing Guide V2

This comprehensive guide covers testing all endpoints of the Evently API, including setup, authentication, and example requests.

## Prerequisites

- Node.js (v14+)
- npm or yarn
- An HTTP client like Postman, Insomnia, or curl
- MySQL database (local or remote)

## Environment Setup

1. Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd evently
npm install
```

2. Create a `.env` file in the root directory with the following variables:

```
NODE_ENV=development
PORT=3000
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USERNAME=root
DATABASE_PASSWORD=your_password
DATABASE_NAME=evently
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRATION=24h
```

3. Set up the database:

```bash
npm run migration:run
npm run seed-dev-data  # Populates the database with test data
```

4. Start the server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`.

## Authentication

Most endpoints require authentication. To authenticate:

1. Register a new user or use a seeded test user
2. Login to obtain a JWT token
3. Include the token in the `Authorization` header of subsequent requests:
   - `Authorization: Bearer <your_token>`

### Example: Register and Login

#### Register a new user

```http
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login

```http
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

Response:

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

## API Endpoints

### Users

#### Get Current User

```http
GET http://localhost:3000/api/users/me
Authorization: Bearer <your_token>
```

#### Update User Profile

```http
PUT http://localhost:3000/api/users/me
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "firstName": "Updated",
  "lastName": "Name"
}
```

### Venues

#### List Venues

```http
GET http://localhost:3000/api/venues?page=1&limit=10
Authorization: Bearer <your_token>
```

#### Get Venue Details

```http
GET http://localhost:3000/api/venues/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your_token>
```

#### Create Venue (Admin Only)

```http
POST http://localhost:3000/api/venues
Authorization: Bearer <your_token>
Content-Type: application/json

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

#### Update Venue (Admin Only)

```http
PUT http://localhost:3000/api/venues/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "name": "Updated Conference Center",
  "capacity": 600
}
```

#### Delete Venue (Admin Only)

```http
DELETE http://localhost:3000/api/venues/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your_token>
```

### Events

#### List Events

```http
GET http://localhost:3000/api/events?page=1&limit=10&sort=startDate&order=ASC
Authorization: Bearer <your_token>
```

#### Get Event Details

```http
GET http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your_token>
```

#### Create Event (Admin Only)

```http
POST http://localhost:3000/api/events
Authorization: Bearer <your_token>
Content-Type: application/json

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

#### Update Event (Admin Only)

```http
PUT http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "title": "Updated Conference 2023",
  "ticketPrice": 129.99
}
```

#### Delete Event (Admin Only)

```http
DELETE http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your_token>
```

### Seats

#### Get Seats for Event

```http
GET http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000/seats
Authorization: Bearer <your_token>
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

#### Get Seat Details

```http
GET http://localhost:3000/api/seats/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your_token>
```

#### Create Seat (Admin Only)

```http
POST http://localhost:3000/api/seats
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "eventId": "123e4567-e89b-12d3-a456-426614174000",
  "row": "A",
  "number": 1,
  "price": 149.99,
  "status": "available"
}
```

#### Update Seat (Admin Only)

```http
PUT http://localhost:3000/api/seats/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "price": 179.99,
  "status": "reserved"
}
```

### Bookings

#### List User Bookings

```http
GET http://localhost:3000/api/bookings?page=1&limit=10
Authorization: Bearer <your_token>
```

#### Get Booking Details

```http
GET http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000
Authorization: Bearer <your_token>
```

#### Create Booking

```http
POST http://localhost:3000/api/bookings
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "eventId": "123e4567-e89b-12d3-a456-426614174000",
  "seatIds": [
    "123e4567-e89b-12d3-a456-426614174001",
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

#### Cancel Booking

```http
PUT http://localhost:3000/api/bookings/123e4567-e89b-12d3-a456-426614174000/cancel
Authorization: Bearer <your_token>
```

### Waitlist

#### Join Waitlist

```http
POST http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000/waitlist
Authorization: Bearer <your_token>
Content-Type: application/json

{
  "numberOfTickets": 2,
  "notificationEmail": "user@example.com"
}
```

#### Check Waitlist Position

```http
GET http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000/waitlist/position
Authorization: Bearer <your_token>
```

#### Leave Waitlist

```http
DELETE http://localhost:3000/api/events/123e4567-e89b-12d3-a456-426614174000/waitlist
Authorization: Bearer <your_token>
```

## Testing with Swagger UI

For a more interactive experience, you can use the Swagger UI available at:

```
http://localhost:3000/api-docs
```

This interface allows you to:
1. Browse all available endpoints
2. View request and response schemas
3. Test endpoints directly in the browser
4. Authenticate with JWT
5. Download OpenAPI specification

## Troubleshooting

### Common Issues

1. **Authentication Failures**
   - Ensure your token is valid and not expired
   - Check that you're using the correct format: `Bearer <token>`

2. **Permission Errors**
   - Verify your user has the correct role for the operation
   - Admin operations require an admin account

3. **Validation Errors**
   - Check the response for specific validation error messages
   - Ensure all required fields are provided
   - Verify data types and formats (dates, emails, etc.)

### Debugging Tips

1. Enable verbose logging:
   ```
   DEBUG=evently:* npm run dev
   ```

2. Check server logs for detailed error information

3. For JWT debugging, decode your token at [jwt.io](https://jwt.io) to inspect its contents

## Automated Testing

Run the automated test suite to verify API functionality:

```bash
npm run test:api
```

This executes a suite of integration tests against all endpoints.
