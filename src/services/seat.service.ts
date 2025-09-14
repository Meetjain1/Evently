import { AppDataSource } from '../config/data-source';
import { Seat, SeatStatus, Event, Venue } from '../models';
import { 
  NotFoundError, 
  ValidationError, 
  ConflictError, 
  ForbiddenError 
} from '../utils/errors';
import { FindOptionsWhere, In } from 'typeorm';
import { PaginationResult, paginateResponse } from '../utils/pagination';
import { removeUndefined } from '../utils/helpers';

export interface CreateSeatInput {
  rowName: string;
  seatNumber: number;
  status?: SeatStatus;
  isActive?: boolean;
  notes?: string;
  venueId: string;
  eventId?: string;
  section?: string;
  isAccessible?: boolean;
}

export interface UpdateSeatInput {
  rowName?: string;
  seatNumber?: number;
  status?: SeatStatus;
  isActive?: boolean;
  notes?: string;
  eventId?: string;
  section?: string;
  isAccessible?: boolean;
}

export interface GetSeatsQueryParams {
  venueId?: string;
  eventId?: string;
  status?: SeatStatus;
  isActive?: boolean;
  rowName?: string;
  seatNumber?: string | number;
  section?: string;
  isAccessible?: boolean;
  sort?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class SeatService {
  private seatRepository = AppDataSource.getRepository(Seat);
  private venueRepository = AppDataSource.getRepository(Venue);
  private eventRepository = AppDataSource.getRepository(Event);
  
  async getEventById(eventId: string): Promise<Event | null> {
    return this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['venue'],
    });
  }

  // Bulk create seats method
  async createSeats(
    venueId: string,
    input: {
      startRow: string;
      endRow: string;
      seatsPerRow: number;
      section?: string;
      isAccessible?: boolean;
      notes?: string;
      eventId?: string;
    },
    creatorId: string,
    isAdmin: boolean
  ): Promise<{ count: number; seats: Seat[] }> {
    // Check if venue exists
    const venue = await this.venueRepository.findOne({
      where: { id: venueId },
    });

    if (!venue) {
      throw new NotFoundError('Venue not found');
    }

    // Check permission
    if (!isAdmin && venue.creatorId !== creatorId) {
      throw new ForbiddenError('You do not have permission to add seats to this venue');
    }

    // Check if venue has seating enabled
    if (!venue.hasSeating) {
      throw new ValidationError('This venue does not support seating');
    }

    // Check event if provided
    let event = null;
    if (input.eventId) {
      event = await this.eventRepository.findOne({
        where: { id: input.eventId },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Ensure event belongs to the venue
      if (event.venueId !== venue.id) {
        throw new ValidationError('Event does not belong to the specified venue');
      }

      // Check if event has seating enabled
      if (!event.hasSeating) {
        throw new ValidationError('This event does not support seating');
      }
    }

    const { startRow, endRow, seatsPerRow } = input;
    const startCharCode = startRow.charCodeAt(0);
    const endCharCode = endRow.charCodeAt(0);

    if (startCharCode > endCharCode) {
      throw new ValidationError('Start row must come before end row');
    }

    const seats: Seat[] = [];
    const createdSeats: Seat[] = [];

    // Create seats for each row
    for (let charCode = startCharCode; charCode <= endCharCode; charCode++) {
      const rowName = String.fromCharCode(charCode);
      
      for (let seatNum = 1; seatNum <= seatsPerRow; seatNum++) {
        const seatInput: CreateSeatInput = {
          venueId,
          rowName: rowName,
          seatNumber: seatNum,
          section: input.section,
          isAccessible: input.isAccessible || false,
          notes: input.notes,
          eventId: input.eventId,
        };
        
        // Check if seat already exists
        const existingSeat = await this.seatRepository.findOne({
          where: {
            venueId,
            rowName,
            seatNumber: seatNum,
          },
        });
        
        if (!existingSeat) {
          const seat = this.seatRepository.create(seatInput);
          seats.push(seat);
        }
      }
    }
    
    if (seats.length > 0) {
      const result = await this.seatRepository.save(seats);
      createdSeats.push(...result);
    }
    
    return {
      count: createdSeats.length,
      seats: createdSeats,
    };
  }

  async createSeat(input: CreateSeatInput, creatorId: string, isAdmin: boolean): Promise<Seat> {
    // Check if venue exists
    const venue = await this.venueRepository.findOne({
      where: { id: input.venueId },
    });

    if (!venue) {
      throw new NotFoundError('Venue not found');
    }

    // Check permission (only venue creator or admin can add seats)
    if (!isAdmin && venue.creatorId !== creatorId) {
      throw new ForbiddenError('You do not have permission to add seats to this venue');
    }

    // Check if venue has seating enabled
    if (!venue.hasSeating) {
      throw new ValidationError('This venue does not support seating');
    }

    // Check if seat with same row and number already exists
    const existingSeat = await this.seatRepository.findOne({
      where: {
        venueId: input.venueId,
        rowName: input.rowName,
        seatNumber: input.seatNumber,
      },
    });

    if (existingSeat) {
      throw new ConflictError(`Seat ${input.rowName}-${input.seatNumber} already exists in this venue`);
    }

    // Check event if provided
    if (input.eventId) {
      const event = await this.eventRepository.findOne({
        where: { id: input.eventId },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Ensure event belongs to the venue
      if (event.venueId !== venue.id) {
        throw new ValidationError('Event does not belong to the specified venue');
      }

      // Check if event has seating enabled
      if (!event.hasSeating) {
        throw new ValidationError('This event does not support seating');
      }
    }

    // Create seat
    const seat = this.seatRepository.create({
      ...input,
    });

    // Save seat
    return this.seatRepository.save(seat);
  }

  async createMultipleSeats(
    venueId: string,
    rows: string[],
    seatsPerRow: number,
    creatorId: string,
    isAdmin: boolean
  ): Promise<number> {
    // Check if venue exists
    const venue = await this.venueRepository.findOne({
      where: { id: venueId },
    });

    if (!venue) {
      throw new NotFoundError('Venue not found');
    }

    // Check permission (only venue creator or admin can add seats)
    if (!isAdmin && venue.creatorId !== creatorId) {
      throw new ForbiddenError('You do not have permission to add seats to this venue');
    }

    // Check if venue has seating enabled
    if (!venue.hasSeating) {
      throw new ValidationError('This venue does not support seating');
    }

    let createdCount = 0;

    // Create seats in batches for performance
    for (const row of rows) {
      const seatsToCreate: Partial<Seat>[] = [];

      for (let i = 1; i <= seatsPerRow; i++) {
        // Check if seat already exists
        const existingSeat = await this.seatRepository.findOne({
          where: {
            venueId,
            rowName: row,
            seatNumber: i,
          },
        });

        if (!existingSeat) {
          seatsToCreate.push({
            rowName: row,
            seatNumber: i,
            status: SeatStatus.AVAILABLE,
            isActive: true,
            venueId,
          });
        }
      }

      if (seatsToCreate.length > 0) {
        const result = await this.seatRepository.insert(seatsToCreate);
        createdCount += result.identifiers.length;
      }
    }

    return createdCount;
  }

  async updateSeat(id: string, input: UpdateSeatInput, userId: string, isAdmin: boolean): Promise<Seat> {
    // Find seat with venue
    const seat = await this.seatRepository.findOne({
      where: { id },
      relations: ['venue'],
    });

    if (!seat) {
      throw new NotFoundError('Seat not found');
    }

    // Check permission (only venue creator or admin can update seats)
    if (!isAdmin && seat.venue.creatorId !== userId) {
      throw new ForbiddenError('You do not have permission to update seats in this venue');
    }

    // Check event if changed
    if (input.eventId && input.eventId !== seat.eventId) {
      const event = await this.eventRepository.findOne({
        where: { id: input.eventId },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Ensure event belongs to the venue
      if (event.venueId !== seat.venueId) {
        throw new ValidationError('Event does not belong to the specified venue');
      }

      // Check if event has seating enabled
      if (!event.hasSeating) {
        throw new ValidationError('This event does not support seating');
      }
    }

    // Check if changing row or seat number would create a duplicate
    if (input.rowName || input.seatNumber) {
      const newRowName = input.rowName || seat.rowName;
      const newSeatNumber = input.seatNumber || seat.seatNumber;

      if (newRowName !== seat.rowName || newSeatNumber !== seat.seatNumber) {
        const existingSeat = await this.seatRepository.findOne({
          where: {
            venueId: seat.venueId,
            rowName: newRowName,
            seatNumber: newSeatNumber,
          },
        });

        if (existingSeat) {
          throw new ConflictError(`Seat ${newRowName}-${newSeatNumber} already exists in this venue`);
        }
      }
    }

    // Update seat
    // Use Object.assign with type casting to fix TypeScript errors
    Object.assign(seat, removeUndefined(input as unknown as Record<string, unknown>));
    return this.seatRepository.save(seat);
  }

  async getSeatById(id: string): Promise<Seat> {
    const seat = await this.seatRepository.findOne({
      where: { id },
      relations: ['venue', 'event'],
    });

    if (!seat) {
      throw new NotFoundError('Seat not found');
    }

    return seat;
  }

  async getSeats(params: GetSeatsQueryParams): Promise<PaginationResult<Seat>> {
    const { 
      venueId, 
      eventId, 
      status, 
      isActive,
      rowName,
      sort = 'rowName',
      order = 'ASC',
      page = 1, 
      limit = 100 
    } = params;

    // Build where conditions
    const where: FindOptionsWhere<Seat> = {};

    if (venueId) {
      where.venueId = venueId;
    }

    if (eventId) {
      where.eventId = eventId;
    }

    if (status) {
      where.status = status;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    if (rowName) {
      where.rowName = rowName;
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.seatRepository.count({ where });

    // Get seats
    const seats = await this.seatRepository.find({
      where,
      relations: ['venue', 'event'],
      order: { [sort]: order, seatNumber: 'ASC' },
      skip,
      take: limit,
    });

    // Return paginated result
    return paginateResponse(seats, page, limit, total);
  }

  async deleteSeat(id: string, userId: string, isAdmin: boolean): Promise<void> {
    // Find seat with venue
    const seat = await this.seatRepository.findOne({
      where: { id },
      relations: ['venue', 'bookedSeats'],
    });

    if (!seat) {
      throw new NotFoundError('Seat not found');
    }

    // Check permission (only venue creator or admin can delete seats)
    if (!isAdmin && seat.venue.creatorId !== userId) {
      throw new ForbiddenError('You do not have permission to delete seats from this venue');
    }

    // Check if seat is already booked
    if (seat.bookedSeats && seat.bookedSeats.length > 0) {
      throw new ConflictError('Cannot delete a seat that has been booked');
    }

    // Delete seat
    await this.seatRepository.remove(seat);
  }

  async getSeatsByIds(ids: string[]): Promise<Seat[]> {
    if (!ids.length) return [];
    
    return this.seatRepository.find({
      where: { id: In(ids) },
      relations: ['venue', 'event'],
    });
  }

  // Add getSeatsAvailability method
  async getSeatsAvailability(eventId: string) {
    // Check if event exists
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['venue'],
    });

    if (!event) {
      throw new NotFoundError('Event not found');
    }

    // Get all seats for this venue
    const seats = await this.seatRepository.find({
      where: { venueId: event.venueId },
      relations: ['bookedSeats'],
    });

    // Check which seats are booked for this event
    const bookedSeats = seats.filter(seat => {
      return seat.bookedSeats?.some(
        bs => bs.seat && bs.booking && bs.booking.eventId === eventId
      );
    });

    // Group seats by row for easier frontend rendering
    const seatsByRow = seats.reduce((acc, seat) => {
      const rowName = seat.rowName;
      if (!acc[rowName]) {
        acc[rowName] = [];
      }
      
      const isBooked = bookedSeats.some(bs => bs.id === seat.id);
      
      acc[rowName].push({
        id: seat.id,
        seatNumber: seat.seatNumber,
        status: isBooked ? SeatStatus.BOOKED : SeatStatus.AVAILABLE,
        isAccessible: seat.isAccessible,
        section: seat.section,
      });
      
      return acc;
    }, {} as Record<string, any[]>);

    return {
      eventId,
      venueName: event.venue?.name || 'Unknown Venue',
      totalSeats: seats.length,
      availableSeats: seats.length - bookedSeats.length,
      bookedSeats: bookedSeats.length,
      seatsByRow,
    };
  }
}
