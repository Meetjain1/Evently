/**
 * @swagger
 * /api/analytics/events/{eventId}:
 *   get:
 *     summary: Get analytics for a specific event
 *     description: Returns detailed analytics for a specific event. Admin only.
 *     tags: [Analytics]
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
 *         description: Event analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalBookings:
 *                   type: number
 *                 totalRevenue:
 *                   type: number
 *                 capacityUtilization:
 *                   type: number
 *                 cancellationRate:
 *                   type: number
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Event not found
 * 
 * /api/analytics/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     description: Returns revenue analytics with filtering options. Admin only.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter up to this date (ISO format)
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter by specific event
 *       - in: query
 *         name: venueId
 *         schema:
 *           type: string
 *         description: Filter by specific venue
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 * 
 * /api/analytics/users:
 *   get:
 *     summary: Get user analytics
 *     description: Returns user registration and activity analytics. Admin only.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter up to this date (ISO format)
 *     responses:
 *       200:
 *         description: User analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 * 
 * /api/analytics/events/popular:
 *   get:
 *     summary: Get popular events
 *     description: Returns events ranked by popularity (bookings)
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter up to this date (ISO format)
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
 *         description: Popular events retrieved successfully
 * 
 * /api/analytics/bookings/trends:
 *   get:
 *     summary: Get booking trends
 *     description: Returns booking trends over time. Admin only.
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter from this date (ISO format)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter up to this date (ISO format)
 *       - in: query
 *         name: interval
 *         schema:
 *           type: string
 *           enum: [daily, weekly, monthly]
 *           default: daily
 *         required: true
 *         description: Interval for trend data
 *       - in: query
 *         name: eventId
 *         schema:
 *           type: string
 *         description: Filter by specific event
 *     responses:
 *       200:
 *         description: Booking trends retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 * 
 * /api/analytics/waitlist/{eventId}:
 *   get:
 *     summary: Get waitlist analytics for an event
 *     description: Returns analytics about the waitlist for a specific event. Admin only.
 *     tags: [Analytics]
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
 *         description: Waitlist analytics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not an admin
 *       404:
 *         description: Event not found
 */
