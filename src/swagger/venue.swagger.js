/**
 * @swagger
 * tags:
 *   name: Venues
 *   description: API for managing venues
 */

/**
 * @swagger
 * /api/venues:
 *   get:
 *     summary: Get all venues
 *     tags: [Venues]
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
 *     responses:
 *       200:
 *         description: A list of venues
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 venues:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Venue'
 *                 totalCount:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *   post:
 *     summary: Create a new venue
 *     tags: [Venues]
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
 *               - address
 *               - city
 *               - state
 *               - zipCode
 *               - country
 *               - totalCapacity
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               address:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 200
 *               city:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               state:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               zipCode:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 20
 *               country:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 100
 *               totalCapacity:
 *                 type: integer
 *                 minimum: 1
 *               hasSeating:
 *                 type: boolean
 *                 default: false
 *               description:
 *                 type: string
 *                 nullable: true
 *           example:
 *             name: "Grand Convention Center"
 *             address: "123 Main Street"
 *             city: "Indore"
 *             state: "Madhya Pradesh"
 *             zipCode: "452001"
 *             country: "India"
 *             totalCapacity: 1500
 *             hasSeating: true
 *             description: "A modern convention center with state-of-the-art facilities and flexible seating arrangements."
 *     responses:
 *       201:
 *         description: Venue created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venue'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *
 * /api/venues/{id}:
 *   get:
 *     summary: Get a venue by ID
 *     tags: [Venues]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Venue details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venue'
 *       404:
 *         description: Venue not found
 *   put:
 *     summary: Update a venue
 *     tags: [Venues]
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
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               zipCode:
 *                 type: string
 *               country:
 *                 type: string
 *               totalCapacity:
 *                 type: integer
 *               hasSeating:
 *                 type: boolean
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Venue updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venue'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you don't have permission
 *       404:
 *         description: Venue not found
 *   delete:
 *     summary: Delete a venue
 *     tags: [Venues]
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
 *         description: Venue deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - you don't have permission
 *       404:
 *         description: Venue not found
 *       409:
 *         description: Cannot delete venue with associated events
 */
