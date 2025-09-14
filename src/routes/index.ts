import { Router } from 'express';
import authRoutes from './auth.routes';
import eventRoutes from './event.routes';
import bookingRoutes from './booking.routes';
import waitlistRoutes from './waitlist.routes';
import venueRoutes from './venue.routes';
import seatRoutes from './seat.routes';
import analyticsRoutes from './analytics.routes';
import directEventSeatsRoute from './direct-event-seats.routes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/events', eventRoutes);
router.use('/bookings', bookingRoutes);
router.use('/waitlist', waitlistRoutes);
router.use('/venues', venueRoutes);
router.use('/seats', seatRoutes);
router.use('/analytics', analyticsRoutes);

// Direct routes (workarounds)
router.use('/', directEventSeatsRoute);

export default router;
