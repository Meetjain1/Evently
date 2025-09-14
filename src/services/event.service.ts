import { AppDataSource } from '../config/data-source';
import { Event, EventStatus, User, Venue } from '../models';
import { 
  NotFoundError, 
  ForbiddenError, 
  ConflictError, 
  ConcurrencyError 
} from '../utils/errors';
import { FindOptionsWhere, ILike, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { PaginationResult, paginateResponse } from '../utils/pagination';
import { removeUndefined } from '../utils/helpers';

export interface CreateEventInput {
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  capacity: number;
  isFeatured?: boolean;
  status?: EventStatus;
  ticketPrice: number;
  hasWaitlist?: boolean;
  maxWaitlistSize?: number;
  hasSeating?: boolean;
  venueId: string;
}

export interface UpdateEventInput {
  name?: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  capacity?: number;
  isFeatured?: boolean;
  status?: EventStatus;
  ticketPrice?: number;
  hasWaitlist?: boolean;
  maxWaitlistSize?: number;
  hasSeating?: boolean;
  venueId?: string;
}

export interface GetEventsQueryParams {
  search?: string;
  startDate?: Date;
  endDate?: Date;
  status?: EventStatus;
  isFeatured?: boolean;
  hasWaitlist?: boolean;
  venueId?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class EventService {
  private eventRepository = AppDataSource.getRepository(Event);
  private venueRepository = AppDataSource.getRepository(Venue);

  async createEvent(input: CreateEventInput, creatorId: string): Promise<Event> {
    // Check if venue exists
    const venue = await this.venueRepository.findOne({
      where: { id: input.venueId },
    });

    if (!venue) {
      throw new NotFoundError('Venue not found');
    }

    // Create event
    const event = this.eventRepository.create({
      ...input,
      creatorId,
    });

    // Save event
    return this.eventRepository.save(event);
  }

  async updateEvent(id: string, input: UpdateEventInput, userId: string, isAdmin: boolean): Promise<Event> {
    // Find event
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check permission (only creator or admin can update)
    if (!isAdmin && event.creatorId !== userId) {
      throw new ForbiddenError('You do not have permission to update this event');
    }

    // Check venue if changed
    if (input.venueId && input.venueId !== event.venueId) {
      const venue = await this.venueRepository.findOne({
        where: { id: input.venueId },
      });

      if (!venue) {
        throw new NotFoundError('Venue not found');
      }
    }

    // If capacity is decreased, check that it's not less than current bookings
    if (input.capacity !== undefined && input.capacity < event.bookedSeats) {
      throw new ConflictError(
        `Cannot reduce capacity below current bookings. Current bookings: ${event.bookedSeats}`
      );
    }

    try {
      // Update event with type casting to fix TypeScript errors
      Object.assign(event, removeUndefined(input as unknown as Record<string, unknown>));
      return await this.eventRepository.save(event);
    } catch (error: any) {
      if (error.name === 'QueryFailedError' && error.message.includes('version')) {
        throw new ConcurrencyError('Event was modified by another request. Please retry.');
      }
      throw error;
    }
  }

  async getEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['venue', 'creator'],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    return event;
  }

  async getEvents(params: GetEventsQueryParams): Promise<PaginationResult<Event>> {
    const { 
      search, 
      startDate, 
      endDate, 
      status, 
      isFeatured, 
      hasWaitlist, 
      venueId,
      sort = 'startDate',
      order = 'ASC',
      page = 1, 
      limit = 10 
    } = params;

    // Build where conditions
    const where: FindOptionsWhere<Event> = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (startDate) {
      where.startDate = MoreThanOrEqual(startDate);
    }

    if (endDate) {
      where.endDate = LessThanOrEqual(endDate);
    }

    if (status) {
      where.status = status;
    }

    if (isFeatured !== undefined) {
      where.isFeatured = isFeatured;
    }

    if (hasWaitlist !== undefined) {
      where.hasWaitlist = hasWaitlist;
    }

    if (venueId) {
      where.venueId = venueId;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.eventRepository.count({ where });

    // Get events
    const events = await this.eventRepository.find({
      where,
      relations: ['venue', 'creator'],
      order: { [sort]: order },
      skip,
      take: limit,
    });

    // Return paginated result
    return paginateResponse(events, page, limit, total);
  }

  async deleteEvent(id: string, userId: string, isAdmin: boolean): Promise<void> {
    // Find event
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['bookings'],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check permission (only creator or admin can delete)
    if (!isAdmin && event.creatorId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this event');
    }

    // Check if event has bookings
    if (event.bookings && event.bookings.length > 0) {
      throw new ConflictError('Cannot delete event with existing bookings');
    }

    // Delete event
    await this.eventRepository.remove(event);
  }

  async getEventsByIds(ids: string[]): Promise<Event[]> {
    if (!ids.length) return [];
    
    return this.eventRepository.find({
      where: { id: In(ids) },
      relations: ['venue'],
    });
  }

  async updateEventBookingCount(eventId: string, delta: number): Promise<Event> {
    // Find event with pessimistic locking to prevent race conditions
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      lock: { mode: 'pessimistic_write' },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Update booked seats count
    event.bookedSeats += delta;

    // Ensure count doesn't go negative or exceed capacity
    if (event.bookedSeats < 0) {
      event.bookedSeats = 0;
    } else if (event.bookedSeats > event.capacity) {
      throw new ConflictError('Event is fully booked');
    }

    // Save updated event
    return this.eventRepository.save(event);
  }

  async publishEvent(id: string, userId: string, isAdmin: boolean): Promise<Event> {
    // Find event
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check permission (only creator or admin can publish)
    if (!isAdmin && event.creatorId !== userId) {
      throw new ForbiddenError('You do not have permission to publish this event');
    }

    // Check if event is already published
    if (event.status === EventStatus.PUBLISHED) {
      throw new ConflictError('Event is already published');
    }

    // Update event status
    event.status = EventStatus.PUBLISHED;
    event.publishedAt = new Date();

    // Save and return updated event
    return this.eventRepository.save(event);
  }

  async unpublishEvent(id: string, userId: string, isAdmin: boolean): Promise<Event> {
    // Find event
    const event = await this.eventRepository.findOne({
      where: { id },
      relations: ['bookings'],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check permission (only creator or admin can unpublish)
    if (!isAdmin && event.creatorId !== userId) {
      throw new ForbiddenError('You do not have permission to unpublish this event');
    }

    // Check if event is already draft
    if (event.status === EventStatus.DRAFT) {
      throw new ConflictError('Event is already in draft status');
    }

    // Check if event has bookings
    if (event.bookings && event.bookings.length > 0) {
      throw new ConflictError('Cannot unpublish event with existing bookings');
    }

    // Update event status
    event.status = EventStatus.DRAFT;
    event.publishedAt = null;

    // Save and return updated event
    return this.eventRepository.save(event);
  }
}
