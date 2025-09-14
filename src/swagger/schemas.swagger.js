/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - firstName
 *         - lastName
 *         - email
 *         - password
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the user
 *         firstName:
 *           type: string
 *           description: First name of the user
 *         lastName:
 *           type: string
 *           description: Last name of the user
 *         email:
 *           type: string
 *           format: email
 *           description: Email address of the user
 *         password:
 *           type: string
 *           format: password
 *           description: Password of the user (hashed)
 *         role:
 *           type: string
 *           enum: [user, admin]
 *           description: User role
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the user was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the user was last updated
 *     
 *     Booking:
 *       type: object
 *       required:
 *         - userId
 *         - eventId
 *         - numberOfTickets
 *         - totalAmount
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the booking
 *         userId:
 *           type: string
 *           description: ID of the user making the booking
 *         eventId:
 *           type: string
 *           description: ID of the event being booked
 *         status:
 *           type: string
 *           enum: [pending, confirmed, cancelled]
 *           description: Status of the booking
 *         numberOfTickets:
 *           type: integer
 *           description: Number of tickets booked
 *         totalAmount:
 *           type: number
 *           format: float
 *           description: Total amount paid for the booking
 *         cancellationReason:
 *           type: string
 *           description: Reason for cancellation, if applicable
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the booking was created
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the booking was last updated
 *
 *     Event:
 *       type: object
 *       required:
 *         - name
 *         - description
 *         - startDate
 *         - endDate
 *         - venueId
 *         - capacity
 *         - ticketPrice
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the event
 *         name:
 *           type: string
 *           description: Name of the event
 *         description:
 *           type: string
 *           description: Description of the event
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Start date and time of the event
 *         endDate:
 *           type: string
 *           format: date-time
 *           description: End date and time of the event
 *         venueId:
 *           type: string
 *           description: ID of the venue where the event will be held
 *         creatorId:
 *           type: string
 *           description: ID of the user who created the event
 *         capacity:
 *           type: integer
 *           description: Maximum number of attendees
 *         bookedSeats:
 *           type: integer
 *           description: Number of seats already booked
 *         ticketPrice:
 *           type: number
 *           format: float
 *           description: Price per ticket
 *         status:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *           description: Current status of the event
 *         hasWaitlist:
 *           type: boolean
 *           description: Whether the event allows waitlisting
 *         hasSeating:
 *           type: boolean
 *           description: Whether the event has assigned seating
 *
 *     Venue:
 *       type: object
 *       required:
 *         - name
 *         - address
 *         - city
 *         - state
 *         - zipCode
 *         - country
 *         - totalCapacity
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the venue
 *         name:
 *           type: string
 *           description: Name of the venue
 *         address:
 *           type: string
 *           description: Street address of the venue
 *         city:
 *           type: string
 *           description: City where the venue is located
 *         state:
 *           type: string
 *           description: State/province where the venue is located
 *         zipCode:
 *           type: string
 *           description: ZIP/Postal code of the venue
 *         country:
 *           type: string
 *           description: Country where the venue is located
 *         totalCapacity:
 *           type: integer
 *           description: Maximum capacity of the venue
 *         hasSeating:
 *           type: boolean
 *           description: Whether the venue has assigned seating
 *         description:
 *           type: string
 *           description: Description of the venue
 *         creatorId:
 *           type: string
 *           description: ID of the user who created the venue
 *
 *     Seat:
 *       type: object
 *       required:
 *         - rowName
 *         - seatNumber
 *         - venueId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the seat
 *         rowName:
 *           type: string
 *           description: Name/designation of the row
 *         seatNumber:
 *           type: integer
 *           description: Number of the seat in the row
 *         status:
 *           type: string
 *           enum: [available, reserved, booked]
 *           description: Current status of the seat
 *         isActive:
 *           type: boolean
 *           description: Whether the seat is active or disabled
 *         notes:
 *           type: string
 *           description: Additional notes about the seat
 *         venueId:
 *           type: string
 *           description: ID of the venue the seat belongs to
 *
 *     BookedSeat:
 *       type: object
 *       required:
 *         - bookingId
 *         - seatId
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the booked seat
 *         bookingId:
 *           type: string
 *           description: ID of the booking
 *         seatId:
 *           type: string
 *           description: ID of the seat that is booked
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date when the seat was booked
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the booked seat was last updated
 *
 *     WaitlistEntry:
 *       type: object
 *       required:
 *         - userId
 *         - eventId
 *         - position
 *         - numberOfTickets
 *       properties:
 *         id:
 *           type: string
 *           description: The auto-generated ID of the waitlist entry
 *         status:
 *           type: string
 *           enum: [waiting, notified, booked, expired]
 *           description: Current status of the waitlist entry
 *         position:
 *           type: integer
 *           description: Position in the waitlist queue
 *         notifiedAt:
 *           type: string
 *           format: date-time
 *           description: Date when the user was notified about availability
 *         numberOfTickets:
 *           type: integer
 *           description: Number of tickets requested
 *         userId:
 *           type: string
 *           description: ID of the user on the waitlist
 *         eventId:
 *           type: string
 *           description: ID of the event for which the user is waitlisted
 *   
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */
