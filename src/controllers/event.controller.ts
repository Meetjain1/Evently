import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../models';
import { getPaginationParams, getSortingParams } from '../utils/helpers';

export class EventController {
  private eventService = new EventService();

  // Create a new event
  createEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const result = await this.eventService.createEvent(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Update an event
  updateEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.eventService.updateEvent(
        req.params.id,
        req.body,
        req.user.id,
        isAdmin
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get event by ID
  getEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.eventService.getEventById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get all events with filtering, pagination, and sorting
  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = getPaginationParams(req);
      const { sort, order } = getSortingParams(req, 'startDate', 'ASC');
      
      const result = await this.eventService.getEvents({
        search: req.query.search as string,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
        status: req.query.status as any,
        isFeatured: req.query.isFeatured === 'true',
        hasWaitlist: req.query.hasWaitlist === 'true',
        venueId: req.query.venueId as string,
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

  // Delete an event
  deleteEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      await this.eventService.deleteEvent(req.params.id, req.user.id, isAdmin);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
  
  // Publish an event
  publishEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.eventService.publishEvent(
        req.params.id,
        req.user.id,
        isAdmin
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  // Unpublish an event
  unpublishEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.eventService.unpublishEvent(
        req.params.id,
        req.user.id,
        isAdmin
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
