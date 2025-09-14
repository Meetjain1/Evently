import { AppDataSource } from '../config/data-source';
import { Venue, Event, Seat } from '../models';
import { 
  NotFoundError, 
  ForbiddenError, 
  ConflictError 
} from '../utils/errors';
import { FindOptionsWhere, ILike, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { PaginationResult, paginateResponse } from '../utils/pagination';
import { removeUndefined } from '../utils/helpers';

export interface CreateVenueInput {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  totalCapacity: number;
  hasSeating: boolean;
  description?: string;
}

export interface UpdateVenueInput {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  totalCapacity?: number;
  hasSeating?: boolean;
  description?: string;
}

export interface GetVenuesQueryParams {
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  hasSeating?: boolean;
  minCapacity?: number;
  maxCapacity?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class VenueService {
  private venueRepository = AppDataSource.getRepository(Venue);
  private eventRepository = AppDataSource.getRepository(Event);
  private seatRepository = AppDataSource.getRepository(Seat);

  async createVenue(input: CreateVenueInput, creatorId: string): Promise<Venue> {
    // Create venue
    const venue = this.venueRepository.create({
      ...input,
      creatorId,
    });

    // Save venue
    return this.venueRepository.save(venue);
  }

  async updateVenue(id: string, input: UpdateVenueInput, userId: string, isAdmin: boolean): Promise<Venue> {
    // Find venue
    const venue = await this.venueRepository.findOne({
      where: { id },
    });

    if (!venue) {
      throw new NotFoundError('Venue not found');
    }

    // Check permission (only creator or admin can update)
    if (!isAdmin && venue.creatorId !== userId) {
      throw new ForbiddenError('You do not have permission to update this venue');
    }

    // If decreasing capacity, check if it conflicts with existing events
    if (input.totalCapacity && input.totalCapacity < venue.totalCapacity) {
      // Check if any event using this venue has a capacity higher than the new total
      const conflictingEvents = await this.eventRepository.count({
        where: {
          venueId: venue.id,
          capacity: MoreThanOrEqual(input.totalCapacity),
        },
      });

      if (conflictingEvents > 0) {
        throw new ConflictError(
          'Cannot reduce venue capacity below the capacity of events using this venue'
        );
      }
    }

    // Update venue with type casting to fix TypeScript errors
    Object.assign(venue, removeUndefined(input as unknown as Record<string, unknown>));
    return this.venueRepository.save(venue);
  }

  async getVenueById(id: string): Promise<Venue> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: ['creator'],
    });

    if (!venue) {
      throw new NotFoundError('Venue not found');
    }

    return venue;
  }

  async getVenues(params: GetVenuesQueryParams): Promise<PaginationResult<Venue>> {
    const { 
      search, 
      city, 
      state, 
      country, 
      hasSeating,
      minCapacity,
      maxCapacity,
      sort = 'name',
      order = 'ASC',
      page = 1, 
      limit = 10 
    } = params;

    // Build where conditions
    const where: FindOptionsWhere<Venue> = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (city) {
      where.city = ILike(`%${city}%`);
    }

    if (state) {
      where.state = ILike(`%${state}%`);
    }

    if (country) {
      where.country = ILike(`%${country}%`);
    }

    if (hasSeating !== undefined) {
      where.hasSeating = hasSeating;
    }

    if (minCapacity && maxCapacity) {
      where.totalCapacity = Between(minCapacity, maxCapacity);
    } else if (minCapacity) {
      where.totalCapacity = MoreThanOrEqual(minCapacity);
    } else if (maxCapacity) {
      where.totalCapacity = LessThanOrEqual(maxCapacity);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.venueRepository.count({ where });

    // Get venues
    const venues = await this.venueRepository.find({
      where,
      relations: ['creator'],
      order: { [sort]: order },
      skip,
      take: limit,
    });

    // Return paginated result
    return paginateResponse(venues, page, limit, total);
  }

  async deleteVenue(id: string, userId: string, isAdmin: boolean): Promise<void> {
    // Find venue
    const venue = await this.venueRepository.findOne({
      where: { id },
    });

    if (!venue) {
      throw new NotFoundError('Venue not found');
    }

    // Check permission (only creator or admin can delete)
    if (!isAdmin && venue.creatorId !== userId) {
      throw new ForbiddenError('You do not have permission to delete this venue');
    }

    // Check if venue has associated events
    const eventsCount = await this.eventRepository.count({
      where: { venueId: venue.id },
    });

    if (eventsCount > 0) {
      throw new ConflictError('Cannot delete venue with associated events');
    }

    // Delete venue
    await this.venueRepository.remove(venue);
  }

  // Helper method to check if venue exists
  async venueExists(id: string): Promise<boolean> {
    const count = await this.venueRepository.count({
      where: { id },
    });

    return count > 0;
  }
}
