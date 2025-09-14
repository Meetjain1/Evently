import { AppDataSource } from '../config/data-source';
import { WaitlistEntry, WaitlistStatus, Event, User } from '../models';
import { 
  NotFoundError, 
  ConflictError,
  ValidationError
} from '../utils/errors';
import { FindOptionsWhere, LessThanOrEqual, MoreThanOrEqual, Between, IsNull } from 'typeorm';
import { PaginationResult, paginateResponse } from '../utils/pagination';

export interface CreateWaitlistEntryInput {
  eventId: string;
  numberOfTickets: number;
}

export interface UpdateWaitlistEntryInput {
  status?: WaitlistStatus;
  notifiedAt?: Date;
}

export interface GetWaitlistEntriesQueryParams {
  eventId?: string;
  userId?: string;
  status?: WaitlistStatus;
  sort?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class WaitlistService {
  private waitlistRepository = AppDataSource.getRepository(WaitlistEntry);
  private eventRepository = AppDataSource.getRepository(Event);
  private userRepository = AppDataSource.getRepository(User);

  async createWaitlistEntry(input: CreateWaitlistEntryInput, userId: string): Promise<WaitlistEntry> {
    // Find event
    const event = await this.eventRepository.findOne({
      where: { id: input.eventId },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check if waitlist is enabled for this event
    if (!event.hasWaitlist) {
      throw new ValidationError('Waitlist is not available for this event');
    }

    // Check if event is fully booked (waitlist only makes sense for fully booked events)
    if (!event.isFullyBooked()) {
      throw new ConflictError('Event is not fully booked. You can book tickets directly.');
    }

    // Check if user is already on waitlist for this event
    const existingEntry = await this.waitlistRepository.findOne({
      where: {
        eventId: input.eventId,
        userId,
      },
    });

    if (existingEntry) {
      throw new ConflictError('You are already on the waitlist for this event');
    }

    // Get count of existing waitlist entries for this event
    const waitlistCount = await this.waitlistRepository.count({
      where: {
        eventId: input.eventId,
        status: WaitlistStatus.WAITING,
      },
    });

    // Check if waitlist has reached maximum size
    if (event.maxWaitlistSize > 0 && waitlistCount >= event.maxWaitlistSize) {
      throw new ConflictError('Waitlist for this event is full');
    }

    // Get user
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Create waitlist entry
    const waitlistEntry = this.waitlistRepository.create({
      eventId: event.id,
      userId: user.id,
      numberOfTickets: input.numberOfTickets,
      position: waitlistCount + 1, // Position is 1-based
      status: WaitlistStatus.WAITING,
    });

    // Save waitlist entry
    return this.waitlistRepository.save(waitlistEntry);
  }

  async getWaitlistEntryById(id: string, userId: string, isAdmin: boolean): Promise<WaitlistEntry> {
    // Find waitlist entry
    const waitlistEntry = await this.waitlistRepository.findOne({
      where: { id },
      relations: ['user', 'event'],
    });

    if (!waitlistEntry) {
      throw new NotFoundError('Waitlist entry not found');
    }

    // Check permission (only entry owner or admin can view)
    if (!isAdmin && waitlistEntry.userId !== userId) {
      throw new NotFoundError('Waitlist entry not found');
    }

    return waitlistEntry;
  }

  async getUserWaitlistEntries(userId: string, params: GetWaitlistEntriesQueryParams): Promise<PaginationResult<WaitlistEntry>> {
    // Force userId to be the requesting user
    params.userId = userId;
    return this.getWaitlistEntries(params);
  }

  async getWaitlistEntries(params: GetWaitlistEntriesQueryParams): Promise<PaginationResult<WaitlistEntry>> {
    const { 
      eventId, 
      userId, 
      status, 
      sort = 'position',
      order = 'ASC',
      page = 1, 
      limit = 10 
    } = params;

    // Build where conditions
    const where: FindOptionsWhere<WaitlistEntry> = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.waitlistRepository.count({ where });

    // Get waitlist entries
    const entries = await this.waitlistRepository.find({
      where,
      relations: ['user', 'event'],
      order: { [sort]: order },
      skip,
      take: limit,
    });

    // Return paginated result
    return paginateResponse(entries, page, limit, total);
  }

  async removeFromWaitlist(id: string, userId: string, isAdmin: boolean): Promise<void> {
    // Find waitlist entry
    const waitlistEntry = await this.waitlistRepository.findOne({
      where: { id },
    });

    if (!waitlistEntry) {
      throw new NotFoundError('Waitlist entry not found');
    }

    // Check permission (only entry owner or admin can remove)
    if (!isAdmin && waitlistEntry.userId !== userId) {
      throw new NotFoundError('Waitlist entry not found');
    }

    // Delete waitlist entry
    await this.waitlistRepository.remove(waitlistEntry);

    // Update positions of all entries with higher positions
    await AppDataSource.createQueryBuilder()
      .update(WaitlistEntry)
      .set({
        position: () => 'position - 1',
      })
      .where('eventId = :eventId AND position > :position', {
        eventId: waitlistEntry.eventId,
        position: waitlistEntry.position,
      })
      .execute();
  }

  async updateWaitlistEntry(id: string, input: UpdateWaitlistEntryInput, isAdmin: boolean): Promise<WaitlistEntry> {
    // Only admin can update waitlist entry status
    if (!isAdmin) {
      throw new ValidationError('Only admins can update waitlist entry status');
    }

    // Find waitlist entry
    const waitlistEntry = await this.waitlistRepository.findOne({
      where: { id },
    });

    if (!waitlistEntry) {
      throw new NotFoundError('Waitlist entry not found');
    }

    // Update waitlist entry
    if (input.status) {
      waitlistEntry.status = input.status;
    }

    if (input.notifiedAt) {
      waitlistEntry.notifiedAt = input.notifiedAt;
    }

    // Save updated waitlist entry
    return this.waitlistRepository.save(waitlistEntry);
  }

  // Notify a waitlist entry about ticket availability
  async notifyWaitlistEntry(waitlistEntryId: string): Promise<WaitlistEntry> {
    // Find waitlist entry
    const waitlistEntry = await this.waitlistRepository.findOne({
      where: { id: waitlistEntryId },
      relations: ['user', 'event'],
    });

    if (!waitlistEntry) {
      throw new NotFoundError('Waitlist entry not found');
    }

    // Check if already notified
    if (waitlistEntry.notifiedAt) {
      throw new ConflictError('User has already been notified');
    }

    // Check if event still has space
    const event = await this.eventRepository.findOne({
      where: { id: waitlistEntry.eventId },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    const availableSeats = event.capacity - event.bookedSeats;

    if (availableSeats < waitlistEntry.numberOfTickets) {
      throw new ValidationError('Not enough available seats for this waitlist entry');
    }

    // Update waitlist entry
    waitlistEntry.notifiedAt = new Date();
    
    // In a real application, you would send an email notification here
    
    return this.waitlistRepository.save(waitlistEntry);
  }

  // Process waitlist for an event, notifying users in order
  async processWaitlist(eventId: string, numberOfTicketsToProcess?: number): Promise<{ 
    processed: number, 
    notified: WaitlistEntry[]
  }> {
    // Find event
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Check how many tickets are available
    let availableSeats = event.capacity - event.bookedSeats;
    
    if (availableSeats <= 0) {
      throw new ValidationError('No available seats to process waitlist');
    }

    // If numberOfTicketsToProcess is specified, limit processing to that number
    if (numberOfTicketsToProcess !== undefined && numberOfTicketsToProcess > 0) {
      availableSeats = Math.min(availableSeats, numberOfTicketsToProcess);
    }

    // Get waitlist entries that haven't been notified yet, ordered by position
    const waitlistEntries = await this.waitlistRepository.find({
      where: {
        eventId,
        status: WaitlistStatus.WAITING,
        notifiedAt: IsNull(),
      },
      order: {
        position: 'ASC',
      },
      relations: ['user'],
    });

    if (waitlistEntries.length === 0) {
      return { processed: 0, notified: [] };
    }

    // Process waitlist entries until we run out of available seats
    const notifiedEntries: WaitlistEntry[] = [];
    let remainingSeats = availableSeats;

    for (const entry of waitlistEntries) {
      if (remainingSeats >= entry.numberOfTickets) {
        // Update entry
        entry.notifiedAt = new Date();
        await this.waitlistRepository.save(entry);
        
        // In a real application, you would send an email notification here
        
        notifiedEntries.push(entry);
        remainingSeats -= entry.numberOfTickets;
      } else {
        // Not enough seats for this entry, stop processing
        break;
      }
    }

    return {
      processed: notifiedEntries.length,
      notified: notifiedEntries,
    };
  }
}
