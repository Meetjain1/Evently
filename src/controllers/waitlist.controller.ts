import { Request, Response, NextFunction } from 'express';
import { WaitlistService } from '../services/waitlist.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../models';
import { getPaginationParams, getSortingParams } from '../utils/helpers';

export class WaitlistController {
  private waitlistService = new WaitlistService();

  // Join waitlist for an event
  joinWaitlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const result = await this.waitlistService.createWaitlistEntry(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get waitlist entry by ID
  getWaitlistEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.waitlistService.getWaitlistEntryById(
        req.params.id,
        req.user.id,
        isAdmin
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get user's waitlist entries
  getUserWaitlistEntries = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { page, limit } = getPaginationParams(req);
      const { sort, order } = getSortingParams(req, 'position', 'ASC');
      
      const result = await this.waitlistService.getUserWaitlistEntries(req.user.id, {
        eventId: req.query.eventId as string,
        status: req.query.status as any,
        sort,
        order,
        page,
        limit,
      });
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get all waitlist entries (admin only)
  getAllWaitlistEntries = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { page, limit } = getPaginationParams(req);
      const { sort, order } = getSortingParams(req, 'position', 'ASC');
      
      const result = await this.waitlistService.getWaitlistEntries({
        eventId: req.query.eventId as string,
        userId: req.query.userId as string,
        status: req.query.status as any,
        sort,
        order,
        page,
        limit,
      });
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Leave waitlist
  leaveWaitlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      await this.waitlistService.removeFromWaitlist(
        req.params.id,
        req.user.id,
        isAdmin
      );
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };

  // Update waitlist entry (admin only)
  updateWaitlistEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const result = await this.waitlistService.updateWaitlistEntry(
        req.params.id,
        req.body,
        true
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  // Get waitlist for an event (admin only)
  getEventWaitlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { page, limit } = getPaginationParams(req);
      const { sort, order } = getSortingParams(req, 'position', 'ASC');
      
      const eventId = req.params.eventId;
      const result = await this.waitlistService.getWaitlistEntries({
        eventId,
        status: req.query.status as any,
        sort,
        order,
        page,
        limit,
      });
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  // Notify waitlist entry about availability (admin only)
  notifyWaitlistEntry = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const result = await this.waitlistService.notifyWaitlistEntry(req.params.id);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  // Process waitlist for an event (admin only)
  processWaitlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const eventId = req.params.eventId;
      const numberOfTickets = req.body.numberOfTickets ? parseInt(req.body.numberOfTickets) : undefined;
      
      const result = await this.waitlistService.processWaitlist(eventId, numberOfTickets);
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
