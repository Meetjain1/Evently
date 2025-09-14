import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../services/booking.service';
import { AuthRequest } from '../middlewares/auth.middleware';
import { UserRole } from '../models';
import { getPaginationParams, getSortingParams } from '../utils/helpers';

export class BookingController {
  private bookingService = new BookingService();

  // Create a new booking
  createBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }
      
      const result = await this.bookingService.createBooking(req.body, req.user.id);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get booking by ID
  getBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.bookingService.getBookingById(
        req.params.id,
        req.user.id,
        isAdmin
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  // Get user's bookings
  getUserBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { page, limit } = getPaginationParams(req);
      const { sort, order } = getSortingParams(req, 'createdAt', 'DESC');
      
      const result = await this.bookingService.getUserBookings(req.user.id, {
        eventId: req.query.eventId as string,
        status: req.query.status as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
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

  // Get all bookings (admin only)
  getAllBookings = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user || req.user.role !== UserRole.ADMIN) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      const { page, limit } = getPaginationParams(req);
      const { sort, order } = getSortingParams(req, 'createdAt', 'DESC');
      
      const result = await this.bookingService.getBookings({
        eventId: req.query.eventId as string,
        userId: req.query.userId as string,
        status: req.query.status as any,
        startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
        endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
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

  // Cancel a booking
  cancelBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.bookingService.cancelBooking(
        req.params.id,
        req.user.id,
        isAdmin,
        req.body.cancellationReason
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
  
  // Update a booking
  updateBooking = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.bookingService.updateBooking(
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
  
  // Confirm payment for a booking
  confirmPayment = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const isAdmin = req.user.role === UserRole.ADMIN;
      const result = await this.bookingService.confirmPayment(
        req.params.id,
        req.body.paymentReference,
        req.user.id,
        isAdmin
      );
      
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
