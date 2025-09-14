import { Router } from 'express';
import { EventController } from '../controllers/event.controller';
import { SeatController } from '../controllers/seat.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import { createEventSchema, updateEventSchema } from '../validations/event.validation';

const router = Router();
const eventController = new EventController();
const seatController = new SeatController();

// Public routes
router.get('/', eventController.getEvents);
router.get('/:id', eventController.getEvent);
router.get('/:eventId/seats', seatController.getSeatsForEvent);

// Protected routes
router.post('/', authenticate, adminOnly, validate(createEventSchema), eventController.createEvent);
router.put('/:id', authenticate, adminOnly, validate(updateEventSchema), eventController.updateEvent);
router.delete('/:id', authenticate, adminOnly, eventController.deleteEvent);
router.post('/:id/publish', authenticate, adminOnly, eventController.publishEvent);
router.post('/:id/unpublish', authenticate, adminOnly, eventController.unpublishEvent);

export default router;
