import { Request, Response, NextFunction } from 'express';
import { VenueService } from '../services/venue.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../models';
import { getPaginationParams, getSortingParams } from '../utils/helpers';

export class VenueController {
  private venueService = new VenueService();

  // Create a new venue
  createVenue = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const result = await this.venueService.createVenue(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Update a venue
  updateVenue = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.venueService.updateVenue(
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

  // Get venue by ID
  getVenue = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.venueService.getVenueById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get all venues with filtering, pagination, and sorting
  getVenues = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = getPaginationParams(req);
      const { sort, order } = getSortingParams(req, 'name', 'ASC');
      
      const result = await this.venueService.getVenues({
        search: req.query.search as string,
        city: req.query.city as string,
        state: req.query.state as string,
        country: req.query.country as string,
        hasSeating: req.query.hasSeating === 'true',
        minCapacity: req.query.minCapacity ? parseInt(req.query.minCapacity as string) : undefined,
        maxCapacity: req.query.maxCapacity ? parseInt(req.query.maxCapacity as string) : undefined,
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

  // Delete a venue
  deleteVenue = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      await this.venueService.deleteVenue(req.params.id, req.user.id, isAdmin);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
