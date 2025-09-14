import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';

const router = Router();
const analyticsController = new AnalyticsController();

// Public analytics route
router.get('/analytics/events/popular', analyticsController.getPopularEvents);

export default router;
