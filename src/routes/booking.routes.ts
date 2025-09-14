import { Router } from 'express';
import { BookingController } from '../controllers/booking.controller';
import { validate } from '../middlewares/validation.middleware';
import { authenticate } from '../middlewares/auth.middleware';
import { createBookingSchema, updateBookingSchema } from '../validations/booking.validation';

const router = Router();
const bookingController = new BookingController();

// Protected routes
router.post('/', authenticate, validate(createBookingSchema), bookingController.createBooking);
router.get('/', authenticate, bookingController.getUserBookings);
router.get('/admin', authenticate, bookingController.getAllBookings);
router.get('/:id', authenticate, bookingController.getBooking);
router.put('/:id', authenticate, validate(updateBookingSchema), bookingController.updateBooking);
router.delete('/:id', authenticate, bookingController.cancelBooking);
router.post('/:id/confirm-payment', authenticate, bookingController.confirmPayment);

export default router;
