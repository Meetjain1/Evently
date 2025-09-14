import { Request, Response, NextFunction } from 'express';
import { SeatService } from '../services/seat.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole, SeatStatus } from '../models';
import { getPaginationParams, getSortingParams } from '../utils/helpers';
import logger from '../utils/logger';

export class SeatController {
  private seatService = new SeatService();

  // Get seats for an event
  getSeatsForEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      logger.debug(`Getting seats for event ID: ${req.params.eventId}`);
      const { page, limit } = getPaginationParams(req);
      const { sort, order } = getSortingParams(req, 'rowName', 'ASC');
      const status = req.query.status as string;
      
      // Get the event to find its venueId
      const event = await this.seatService.getEventById(req.params.eventId);
      logger.debug(`Event found: ${event ? 'yes' : 'no'}`);
      if (!event) {
        logger.debug('Event not found, returning 404');
        return res.status(404).json({ message: 'Not Found - The requested resource does not exist' });
      }
      logger.debug(`Event venue ID: ${event.venueId}`);
      
      // Now get seats for the venue, filtered by this event if seats are assigned to events
      const result = await this.seatService.getSeats({
        venueId: event.venueId,
        eventId: req.params.eventId,
        status: status ? status as SeatStatus : undefined,
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

  // Create seats for a venue - handles both bulk and single seat creation
  createSeats = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const isAdmin = req.user.role === UserRole.ADMIN;

      // Check if the request has bulk creation parameters
      if (req.body.startRow && req.body.endRow && req.body.seatsPerRow) {
        // Bulk creation
        const result = await this.seatService.createSeats(
          req.params.venueId,
          req.body,
          req.user.id,
          isAdmin
        );
        
        return res.status(201).json(result);
      } else if (req.body.row && req.body.seatNumber) {
        // Single seat creation
        // Map from schema field 'row' to model field 'rowName'
        const input = {
          rowName: req.body.row,
          seatNumber: req.body.seatNumber,
          status: req.body.status,
          isActive: req.body.isActive,
          notes: req.body.notes,
          section: req.body.section,
          isAccessible: req.body.isAccessible,
          venueId: req.params.venueId,
          eventId: req.body.eventId
        };
        
        const result = await this.seatService.createSeat(input, req.user.id, isAdmin);
        return res.status(201).json(result);
      } else {
        // Neither format is valid
        return res.status(400).json({ 
          message: "Invalid request format. Please provide either (row, seatNumber) for single seat creation or (startRow, endRow, seatsPerRow) for bulk creation."
        });
      }
    } catch (error) {
      next(error);
    }
  };
  
  // Create a single seat for a venue - keeping this for compatibility but redirecting to createSeats
  createSeat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    return this.createSeats(req, res, next);
  };

  // Update a seat
  updateSeat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.seatService.updateSeat(
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

  // Get a seat by ID
  getSeat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.seatService.getSeatById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get all seats for a venue with filtering, pagination, and sorting
  getSeats = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page, limit } = getPaginationParams(req);
      const { sort, order } = getSortingParams(req, 'row', 'ASC');
      
      const result = await this.seatService.getSeats({
        venueId: req.params.venueId,
        rowName: req.query.row as string,
        seatNumber: req.query.seatNumber as string,
        section: req.query.section as string,
        isAccessible: req.query.isAccessible === 'true',
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

  // Get seats availability for an event
  getSeatsAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await this.seatService.getSeatsAvailability(req.params.eventId);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Delete a seat
  deleteSeat = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      await this.seatService.deleteSeat(req.params.id, req.user.id, isAdmin);
      
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  };
}
