import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// All analytics routes go through authentication, but the authenticate middleware
// has special logic to bypass the '/analytics/events/popular' path
router.use(authenticate);

// Popular events endpoint (will be bypassed by auth middleware)
router.get('/events/popular', analyticsController.getPopularEvents);

// Analytics routes that require admin rights
router.get('/events/:eventId', adminOnly, analyticsController.getEventAnalytics);
router.get('/revenue', adminOnly, analyticsController.getRevenueAnalytics);
router.get('/users', adminOnly, analyticsController.getUserAnalytics);
router.get('/bookings/trends', adminOnly, analyticsController.getBookingTrends);
router.get('/waitlist/:eventId', adminOnly, analyticsController.getWaitlistAnalytics);

export default router;
