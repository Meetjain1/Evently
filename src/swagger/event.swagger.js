/**
 * @swagger
 * tags:
 *   name: Events
 *   description: API for managing events
 */

/**
 * @swagger
 * /api/events:
 *   get:
 *     summary: Get all events
 *     tags: [Events]
 *     parameters:
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
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, cancelled, completed]
 *         description: Filter events by status
 *     responses:
 *       200:
 *         description: A list of events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Event'
 *                 totalCount:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *   post:
 *     summary: Create a new event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - startDate
 *               - endDate
 *               - venueId
 *               - capacity
 *               - ticketPrice
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               venueId:
 *                 type: string
 *                 format: uuid
 *               capacity:
 *                 type: integer
 *                 minimum: 1
 *               ticketPrice:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *               hasWaitlist:
 *                 type: boolean
 *                 default: false
 *               maxWaitlistSize:
 *                 type: integer
 *                 default: 0
 *               hasSeating:
 *                 type: boolean
 *                 default: false
 *               isFeatured:
 *                 type: boolean
 *                 default: false
 *               status:
 *                 type: string
 *                 enum: [draft, published, cancelled, completed]
 *                 default: draft
 *           example:
 *             name: "Tech Conference 2025"
 *             description: "Annual technology conference featuring the latest innovations and industry trends."
 *             startDate: "2025-12-15T09:00:00.000Z"
 *             endDate: "2025-12-15T18:00:00.000Z"
 *             venueId: "550e8400-e29b-41d4-a716-446655440000"
 *             capacity: 500
 *             ticketPrice: 149.99
 *             hasWaitlist: true
 *             maxWaitlistSize: 100
 *             hasSeating: false
 *             isFeatured: true
 *             status: "draft"
 *     responses:
 *       201:
 *         description: Event created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /api/events/{id}:
 *   get:
 *     summary: Get an event by ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       404:
 *         description: Event not found
 *   put:
 *     summary: Update an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               venueId:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               ticketPrice:
 *                 type: number
 *                 format: float
 *               status:
 *                 type: string
 *                 enum: [draft, published, cancelled, completed]
 *               hasWaitlist:
 *                 type: boolean
 *               maxWaitlistSize:
 *                 type: integer
 *               hasSeating:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Event updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Event'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you don't have permission
 *       404:
 *         description: Event not found
 *   delete:
 *     summary: Delete an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you don't have permission
 *       404:
 *         description: Event not found
 *
 * /api/events/{id}/publish:
 *   post:
 *     summary: Publish an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event published successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you don't have permission
 *       404:
 *         description: Event not found
 *
 * /api/events/{id}/unpublish:
 *   post:
 *     summary: Unpublish an event (change to draft)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event unpublished successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you don't have permission
 *       404:
 *         description: Event not found
 *       409:
 *         description: Cannot unpublish event with existing bookings
 *
 * /api/events/{id}/cancel:
 *   patch:
 *     summary: Cancel an event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Event cancelled successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you don't have permission
 *       404:
 *         description: Event not found
 */
