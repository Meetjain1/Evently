import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, adminOnly } from '../middlewares/auth.middleware';

const router = Router();
const analyticsController = new AnalyticsController();

// All analytics routes require authentication and admin rights
router.get('/events/:eventId', authenticate, adminOnly, analyticsController.getEventAnalytics);
router.get('/revenue', authenticate, adminOnly, analyticsController.getRevenueAnalytics);
router.get('/users', authenticate, adminOnly, analyticsController.getUserAnalytics);
router.get('/events/popular', authenticate, analyticsController.getPopularEvents);
router.get('/bookings/trends', authenticate, adminOnly, analyticsController.getBookingTrends);
router.get('/waitlist/:eventId', authenticate, adminOnly, analyticsController.getWaitlistAnalytics);

export default router;
