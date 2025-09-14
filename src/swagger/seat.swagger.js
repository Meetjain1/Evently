/**
 * @swagger
 * /api/seats/venue/{venueId}:
 *   post:
 *     summary: Create seats for a venue
 *     description: Create multiple seats for a venue. Admin only.
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: venueId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the venue
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - startRow
 *               - endRow
 *               - seatsPerRow
 *             properties:
 *               startRow:
 *                 type: string
 *                 description: First row identifier (e.g., A)
 *               endRow:
 *                 type: string
 *                 description: Last row identifier (e.g., Z)
 *               seatsPerRow:
 *                 type: integer
 *                 description: Number of seats in each row
 *               section:
 *                 type: string
 *                 description: Optional section name (e.g., "Orchestra", "Balcony")
 *               isAccessible:
 *                 type: boolean
 *                 description: Whether these seats are accessible
 *               notes:
 *                 type: string
 *                 description: Optional notes about these seats
 *               eventId:
 *                 type: string
 *                 description: Optional event ID if seats are for a specific event
 *     responses:
 *       201:
 *         description: Seats created successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Event not found
 *       409:
 *         description: Seat already exists or event doesn't support seating
 * 
 * /api/events/{eventId}/seats:
 *   get:
 *     summary: Get seats for an event
 *     description: Returns all seats for an event with their availability status
 *     tags: [Seats]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the event
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [available, reserved, booked, blocked]
 *         description: Filter seats by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Seats retrieved successfully
 *       404:
 *         description: Event not found
 * 
 * /api/seats/{id}:
 *   get:
 *     summary: Get a specific seat
 *     description: Returns details of a specific seat
 *     tags: [Seats]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the seat
 *     responses:
 *       200:
 *         description: Seat details retrieved successfully
 *       404:
 *         description: Seat not found
 * 
 *   put:
 *     summary: Update a seat
 *     description: Update details of a specific seat. Admin only.
 *     tags: [Seats]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the seat
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [available, reserved, booked, blocked]
 *                 description: Status of the seat
 *               isActive:
 *                 type: boolean
 *                 description: Whether the seat is active
 *     responses:
 *       200:
 *         description: Seat updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Seat not found
 */
