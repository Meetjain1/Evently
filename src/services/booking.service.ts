import { AppDataSource } from '../config/data-source';
import { Booking, BookingStatus, Event, BookedSeat, Seat, SeatStatus, User, WaitlistEntry, WaitlistStatus } from '../models';
import { 
  NotFoundError, 
  ConflictError, 
  ValidationError, 
  ConcurrencyError 
} from '../utils/errors';
import { FindOptionsWhere, Between, LessThanOrEqual, MoreThanOrEqual, In } from 'typeorm';
import { PaginationResult, paginateResponse } from '../utils/pagination';
import { EventService } from './event.service';
import { WaitlistService } from './waitlist.service';

export interface CreateBookingInput {
  eventId: string;
  numberOfTickets: number;
  seatIds?: string[];
}

export interface UpdateBookingInput {
  status?: BookingStatus;
  cancellationReason?: string;
}

export interface GetBookingsQueryParams {
  eventId?: string;
  userId?: string;
  status?: BookingStatus;
  startDate?: Date;
  endDate?: Date;
  sort?: string;
  order?: 'ASC' | 'DESC';
  page?: number;
  limit?: number;
}

export class BookingService {
  private bookingRepository = AppDataSource.getRepository(Booking);
  private eventRepository = AppDataSource.getRepository(Event);
  private seatRepository = AppDataSource.getRepository(Seat);
  private bookedSeatRepository = AppDataSource.getRepository(BookedSeat);
  private userRepository = AppDataSource.getRepository(User);
  private eventService = new EventService();
  private waitlistService = new WaitlistService();

  async createBooking(input: CreateBookingInput, userId: string): Promise<Booking> {
    // Start transaction to ensure atomicity
    return AppDataSource.transaction(async (manager) => {
      // Get event with pessimistic locking to prevent race conditions
      const event = await manager.findOne(Event, {
        where: { id: input.eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Check if the event is available for booking
      if (!event.isAvailableForBooking()) {
        throw new ConflictError(
          'This event is not available for booking. It may be fully booked, cancelled, or past the event date.'
        );
      }

      // Check if there are enough tickets available
      if (event.bookedSeats + input.numberOfTickets > event.capacity) {
        throw new ConflictError(
          `Not enough tickets available. Only ${event.capacity - event.bookedSeats} tickets left.`
        );
      }

      // Get user
      const user = await manager.findOne(User, {
        where: { id: userId },
      });

      if (!user) {
        throw new NotFoundError('User not found');
      }

      // Create booking
      const booking = manager.create(Booking, {
        eventId: event.id,
        userId: user.id,
        numberOfTickets: input.numberOfTickets,
        status: BookingStatus.CONFIRMED,
        totalAmount: input.numberOfTickets * event.ticketPrice,
      });

      // If event has seating and seat IDs are provided, book specific seats
      if (event.hasSeating && input.seatIds && input.seatIds.length > 0) {
        // Validate number of seats matches tickets
        if (input.seatIds.length !== input.numberOfTickets) {
          throw new ValidationError(
            `Number of selected seats (${input.seatIds.length}) must match number of tickets (${input.numberOfTickets})`
          );
        }

        // Check and reserve seats
        const seats = await manager.find(Seat, {
          where: { 
            id: In(input.seatIds),
            eventId: event.id,
            status: SeatStatus.AVAILABLE,
            isActive: true
          },
          lock: { mode: 'pessimistic_write' },
        });

        // Verify all seats were found and are available
        if (seats.length !== input.seatIds.length) {
          throw new ConflictError('One or more selected seats are unavailable');
        }

        // Save booking first to get the ID
        const savedBooking = await manager.save(booking);

        // Update seat status and create booked seat records
        for (const seat of seats) {
          seat.status = SeatStatus.BOOKED;
          await manager.save(seat);

          const bookedSeat = manager.create(BookedSeat, {
            bookingId: savedBooking.id,
            seatId: seat.id,
          });
          await manager.save(bookedSeat);
        }

        // Update event booked seats count
        event.bookedSeats += input.numberOfTickets;
        await manager.save(event);

        return savedBooking;
      } else {
        // Standard booking without specific seats
        const savedBooking = await manager.save(booking);

        // Update event booked seats count
        event.bookedSeats += input.numberOfTickets;
        await manager.save(event);

        return savedBooking;
      }
    }).catch((error) => {
      if (error.name === 'QueryFailedError' && error.message.includes('version')) {
        throw new ConcurrencyError('Event was modified by another request. Please retry.');
      }
      throw error;
    });
  }

  async getBookingById(id: string, userId: string, isAdmin: boolean): Promise<Booking> {
    // Find booking
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'event', 'bookedSeats', 'bookedSeats.seat'],
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Check permission (only booking owner or admin can view)
    if (!isAdmin && booking.userId !== userId) {
      throw new NotFoundError('Booking not found');
    }

    return booking;
  }

  async getUserBookings(userId: string, params: GetBookingsQueryParams): Promise<PaginationResult<Booking>> {
    // Force userId to be the requesting user
    params.userId = userId;
    return this.getBookings(params);
  }

  async getBookings(params: GetBookingsQueryParams): Promise<PaginationResult<Booking>> {
    const { 
      eventId, 
      userId, 
      status, 
      startDate, 
      endDate,
      sort = 'createdAt',
      order = 'DESC',
      page = 1, 
      limit = 10 
    } = params;

    // Build where conditions
    const where: FindOptionsWhere<Booking> = {};

    if (eventId) {
      where.eventId = eventId;
    }

    if (userId) {
      where.userId = userId;
    }

    if (status) {
      where.status = status;
    }

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      where.createdAt = MoreThanOrEqual(startDate);
    } else if (endDate) {
      where.createdAt = LessThanOrEqual(endDate);
    }

    // Calculate pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await this.bookingRepository.count({ where });

    // Get bookings
    const bookings = await this.bookingRepository.find({
      where,
      relations: ['user', 'event'],
      order: { [sort]: order },
      skip,
      take: limit,
    });

    // Return paginated result
    return paginateResponse(bookings, page, limit, total);
  }

  async cancelBooking(id: string, userId: string, isAdmin: boolean, reason?: string): Promise<Booking> {
    // Use transaction for atomicity
    return AppDataSource.transaction(async (manager) => {
      // Find booking with relations
      const booking = await manager.findOne(Booking, {
        where: { id },
        relations: ['event', 'bookedSeats', 'bookedSeats.seat'],
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      // Check permission (only booking owner or admin can cancel)
      if (!isAdmin && booking.userId !== userId) {
        throw new NotFoundError('Booking not found');
      }

      // Check if booking is already cancelled
      if (booking.status === BookingStatus.CANCELLED) {
        throw new ConflictError('Booking is already cancelled');
      }

      // Get event with locking
      const event = await manager.findOne(Event, {
        where: { id: booking.eventId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!event) {
        throw new NotFoundError('Event not found');
      }

      // Update booking status
      booking.status = BookingStatus.CANCELLED;
      booking.cancellationReason = reason || 'Cancelled by user';

      // Update event booked seats count
      event.bookedSeats -= booking.numberOfTickets;
      await manager.save(event);

      // If there are booked seats, update their status
      if (booking.bookedSeats && booking.bookedSeats.length > 0) {
        for (const bookedSeat of booking.bookedSeats) {
          const seat = bookedSeat.seat;
          seat.status = SeatStatus.AVAILABLE;
          await manager.save(seat);
        }
      }

      // Save updated booking
      const updatedBooking = await manager.save(booking);

      // Check if there are waitlist entries to notify
      if (event.hasWaitlist) {
        await this.processWaitlist(event.id);
      }

      return updatedBooking;
    }).catch((error) => {
      if (error.name === 'QueryFailedError' && error.message.includes('version')) {
        throw new ConcurrencyError('Resource was modified by another request. Please retry.');
      }
      throw error;
    });
  }

  // Process waitlist when tickets become available
  private async processWaitlist(eventId: string): Promise<void> {
    // Get event
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
    });

    if (!event || !event.hasWaitlist) {
      return;
    }

    // Calculate available tickets
    const availableTickets = event.capacity - event.bookedSeats;
    if (availableTickets <= 0) {
      return;
    }

    // Get waiting entries ordered by position
    const waitingEntries = await AppDataSource.getRepository(WaitlistEntry).find({
      where: {
        eventId,
        status: WaitlistStatus.WAITING,
      },
      order: { position: 'ASC' },
    });

    // Notify waitlist entries that could be accommodated
    for (const entry of waitingEntries) {
      if (entry.numberOfTickets <= availableTickets) {
        // Update waitlist entry status
        entry.status = WaitlistStatus.NOTIFIED;
        entry.notifiedAt = new Date();
        await AppDataSource.getRepository(WaitlistEntry).save(entry);

        // TODO: Send notification to user (implement in notification service)
        // This would typically send an email or push notification

        break; // Only notify the first eligible entry
      }
    }
  }

  async updateBooking(id: string, input: UpdateBookingInput, userId: string, isAdmin: boolean): Promise<Booking> {
    // Use transaction for atomicity
    return AppDataSource.transaction(async (manager) => {
      // Find booking with relations
      const booking = await manager.findOne(Booking, {
        where: { id },
        relations: ['event', 'bookedSeats', 'bookedSeats.seat'],
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      // Check permission (only booking owner or admin can update)
      if (!isAdmin && booking.userId !== userId) {
        throw new NotFoundError('Booking not found');
      }

      // Check if booking is already cancelled
      if (booking.status === BookingStatus.CANCELLED) {
        throw new ConflictError('Cannot update a cancelled booking');
      }

      // Update booking fields
      if (input.status !== undefined) {
        booking.status = input.status;
      }

      if (input.cancellationReason !== undefined) {
        booking.cancellationReason = input.cancellationReason;
      }

      // If status is being changed to CANCELLED, handle the cancellation logic
      if (input.status === BookingStatus.CANCELLED && booking.status !== BookingStatus.CANCELLED) {
        // Get event with locking
        const event = await manager.findOne(Event, {
          where: { id: booking.eventId },
          lock: { mode: 'pessimistic_write' },
        });

        if (!event) {
          throw new NotFoundError('Event not found');
        }

        // Update event booked seats count
        event.bookedSeats -= booking.numberOfTickets;
        await manager.save(event);

        // If there are booked seats, update their status
        if (booking.bookedSeats && booking.bookedSeats.length > 0) {
          for (const bookedSeat of booking.bookedSeats) {
            const seat = bookedSeat.seat;
            seat.status = SeatStatus.AVAILABLE;
            await manager.save(seat);
          }
        }

        // Check if there are waitlist entries to notify
        if (event.hasWaitlist) {
          await this.processWaitlist(event.id);
        }
      }

      // Save updated booking
      return manager.save(booking);
    }).catch((error) => {
      if (error.name === 'QueryFailedError' && error.message.includes('version')) {
        throw new ConcurrencyError('Resource was modified by another request. Please retry.');
      }
      throw error;
    });
  }

  async confirmPayment(id: string, paymentReference: string, userId: string, isAdmin: boolean): Promise<Booking> {
    // Use transaction for atomicity
    return AppDataSource.transaction(async (manager) => {
      // Find booking
      const booking = await manager.findOne(Booking, {
        where: { id },
      });

      if (!booking) {
        throw new NotFoundError('Booking not found');
      }

      // Check permission (only booking owner or admin can confirm payment)
      if (!isAdmin && booking.userId !== userId) {
        throw new NotFoundError('Booking not found');
      }

      // Check if booking is already cancelled
      if (booking.status === BookingStatus.CANCELLED) {
        throw new ConflictError('Cannot confirm payment for a cancelled booking');
      }

      // Check if payment is already confirmed
      if (booking.paymentReference) {
        throw new ConflictError('Payment already confirmed');
      }

      // Update booking with payment information
      booking.paymentReference = paymentReference;
      booking.paymentDate = new Date();
      booking.status = BookingStatus.CONFIRMED;

      // Save updated booking
      return manager.save(booking);
    }).catch((error) => {
      if (error.name === 'QueryFailedError' && error.message.includes('version')) {
        throw new ConcurrencyError('Resource was modified by another request. Please retry.');
      }
      throw error;
    });
  }
}
