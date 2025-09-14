import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../models';
import { getPaginationParams } from '../utils/helpers';

export class AnalyticsController {
  private analyticsService = new AnalyticsService();

  // Get event analytics
  getEventAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
      }
      
      const eventId = req.params.eventId;
      const result = await this.analyticsService.getEventAnalytics(eventId);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get revenue analytics
  getRevenueAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
      }
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const result = await this.analyticsService.getRevenueAnalytics({
        startDate,
        endDate,
        eventId: req.query.eventId as string,
        venueId: req.query.venueId as string,
      });
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get user analytics
  getUserAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
      }
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const result = await this.analyticsService.getUserAnalytics();
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get popular events
  getPopularEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = getPaginationParams(req);
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const result = await this.analyticsService.getPopularEvents(limit);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get booking trends
  getBookingTrends = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
      }
      
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      const interval = req.query.interval as 'daily' | 'weekly' | 'monthly' || 'weekly';
      
      // Convert interval to the format expected by the service
      let period: 'day' | 'week' | 'month' = 'day';
      if (interval === 'weekly') period = 'week';
      else if (interval === 'monthly') period = 'month';
      
      // Get eventId if specified
      const eventId = req.query.eventId as string;
      
      // Call the service with the correct parameters
      const result = await this.analyticsService.getBookingTrends(period);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get waitlist analytics
  getWaitlistAnalytics = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden - Admin access required' });
      }
      
      const eventId = req.params.eventId;
      const result = await this.analyticsService.getWaitlistAnalytics(eventId);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
