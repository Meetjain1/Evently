/**
 * @swagger
 * /api/waitlist:
 *   post:
 *     summary: Join a waitlist
 *     description: Add user to event waitlist when the event is fully booked
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - eventId
 *               - numberOfTickets
 *             properties:
 *               eventId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of the event
 *               numberOfTickets:
 *                 type: integer
 *                 minimum: 1
 *                 description: Number of tickets requested
 *           example:
 *             eventId: "550e8400-e29b-41d4-a716-446655440000"
 *             numberOfTickets: 3
 *     responses:
 *       201:
 *         description: Successfully added to waitlist
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Event not found
 *       409:
 *         description: Event not fully booked or waitlist full
 * 
 *   get:
 *     summary: Get all waitlist entries
 *     description: Returns all waitlist entries. Admin only.
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter by event ID
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [waiting, notified, expired, converted]
 *         description: Filter by waitlist status
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
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Waitlist entries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 * 
 * /api/waitlist/user/events/{eventId}:
 *   get:
 *     summary: Check user's waitlist position
 *     description: Returns user's position on the waitlist for an event
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: eventId
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the event
 *     responses:
 *       200:
 *         description: Waitlist position retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 position:
 *                   type: integer
 *                 numberOfTickets:
 *                   type: integer
 *                 status:
 *                   type: string
 *                   enum: [waiting, notified, expired, converted]
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Not on waitlist
 * 
 * /api/waitlist/events/{eventId}:
 *   get:
 *     summary: Get waitlist for an event
 *     description: Returns all waitlist entries for a specific event. Admin only.
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
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
 *           enum: [waiting, notified, expired, converted]
 *         description: Filter by waitlist status
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
 *           default: 10
 *         description: Results per page
 *     responses:
 *       200:
 *         description: Waitlist entries retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Event not found
 * 
 * /api/waitlist/{id}:
 *   delete:
 *     summary: Remove from waitlist
 *     description: Remove a user from a waitlist. User can only remove themselves, admin can remove anyone.
 *     tags: [Waitlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the waitlist entry
 *     responses:
 *       204:
 *         description: Successfully removed from waitlist
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not authorized to remove this entry
 *       404:
 *         description: Waitlist entry not found
 */
