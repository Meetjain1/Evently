import { Router } from 'express';
import { SeatController } from '../controllers/seat.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';
import { createSeatSchema, updateSeatSchema } from '../validations/seat.validation';

const router = Router();
const seatController = new SeatController();

// Public routes
router.get('/venue/:venueId', seatController.getSeats);
router.get('/availability/:eventId', seatController.getSeatsAvailability);
router.get('/:id', seatController.getSeat);

// Protected routes - special direct route without validation middleware
router.post('/venue/:venueId', authenticate, adminOnly, seatController.createSeats);
router.put('/:id', authenticate, adminOnly, validate(updateSeatSchema), seatController.updateSeat);
router.delete('/:id', authenticate, adminOnly, seatController.deleteSeat);

export default router;
