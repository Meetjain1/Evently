import { Router } from 'express';
import { SeatService } from '../services/seat.service';
import { EventService } from '../services/event.service';
import { Request, Response, NextFunction } from 'express';
import { getPaginationParams, getSortingParams } from '../utils/helpers';
import { SeatStatus } from '../models';
import logger from '../utils/logger';

const router = Router();
const seatService = new SeatService();
const eventService = new EventService();

// Direct endpoint for getting seats by event
router.get('/api/events/:eventId/seats', async (req: Request, res: Response, next: NextFunction) => {
  try {
    logger.debug(`Direct route: Getting seats for event ID: ${req.params.eventId}`);
    const { page, limit } = getPaginationParams(req);
    const { sort, order } = getSortingParams(req, 'rowName', 'ASC');
    const status = req.query.status as string;
    
    // Get the event to find its venueId
    const event = await eventService.getEventById(req.params.eventId);
    
    logger.debug(`Direct route: Event found: ${event ? 'yes' : 'no'}`);
    if (!event) {
      logger.debug('Direct route: Event not found, returning 404');
      return res.status(404).json({ message: 'Not Found - The requested resource does not exist' });
    }
    
    logger.debug(`Direct route: Event venue ID: ${event.venueId}`);
    
    // Now get seats for the venue, filtered by this event if seats are assigned to events
    const result = await seatService.getSeats({
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
    logger.error('Error in direct event seats route:', error);
    next(error);
  }
});

export default router;
