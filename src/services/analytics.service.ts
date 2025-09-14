import { AppDataSource } from '../config/data-source';
import { Event, Booking, BookingStatus, User, Venue } from '../models';
import { Between, In } from 'typeorm';

// Analytics response interfaces
export interface BookingAnalytics {
  totalBookings: number;
  totalRevenue: number;
  totalCancelledBookings: number;
  averageBookingSize: number;
  timeSeriesData: {
    date: string;
    bookings: number;
    revenue: number;
  }[];
}

export interface EventPopularity {
  id: string;
  name: string;
  venueId: string;
  venueName: string;
  totalBookings: number;
  totalRevenue: number;
  capacityUtilizationPercentage: number;
  startDate: Date;
}

export interface CapacityUtilization {
  eventId: string;
  eventName: string;
  venueId: string;
  venueName: string;
  capacity: number;
  bookedSeats: number;
  utilization: number; // Percentage of capacity filled
  startDate: Date;
}

export class AnalyticsService {
  private eventRepository = AppDataSource.getRepository(Event);
  private bookingRepository = AppDataSource.getRepository(Booking);
  private userRepository = AppDataSource.getRepository(User);
  private venueRepository = AppDataSource.getRepository(Venue);

  async getBookingAnalytics(
    startDate?: Date,
    endDate?: Date,
    eventId?: string,
    venueId?: string,
    groupBy: 'day' | 'week' | 'month' = 'day'
  ): Promise<BookingAnalytics> {
    // Set default date range if not provided
    const now = new Date();
    const defaultEndDate = new Date(now);
    const defaultStartDate = new Date(now);
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 1);

    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    // Build query conditions
    const whereConditions: any = {
      createdAt: Between(queryStartDate, queryEndDate),
    };

    if (eventId) {
      whereConditions.eventId = eventId;
    }

    if (venueId) {
      // Join with events to filter by venue
      whereConditions.event = {
        venueId,
      };
    }

    // Get all bookings in date range
    const bookings = await this.bookingRepository.find({
      where: whereConditions,
      relations: ['event'],
    });

    // Calculate analytics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
    const totalCancelledBookings = bookings.filter(
      (booking) => booking.status === BookingStatus.CANCELLED
    ).length;
    const totalTickets = bookings.reduce((sum, booking) => sum + booking.numberOfTickets, 0);
    const averageBookingSize = totalBookings > 0 ? totalTickets / totalBookings : 0;

    // Generate time series data
    const timeSeriesData = this.generateTimeSeriesData(bookings, queryStartDate, queryEndDate, groupBy);

    return {
      totalBookings,
      totalRevenue,
      totalCancelledBookings,
      averageBookingSize,
      timeSeriesData,
    };
  }

  async getEventPopularity(
    startDate?: Date,
    endDate?: Date,
    limit = 10,
    venueId?: string
  ): Promise<EventPopularity[]> {
    // Set default date range if not provided
    const now = new Date();
    const defaultEndDate = new Date(now);
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
    const defaultStartDate = new Date(now);
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    // Get events in date range
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .leftJoinAndSelect('event.bookings', 'booking', 'booking.status = :status', {
        status: BookingStatus.CONFIRMED,
      })
      .where('event.startDate BETWEEN :startDate AND :endDate', {
        startDate: queryStartDate,
        endDate: queryEndDate,
      });

    if (venueId) {
      queryBuilder.andWhere('event.venueId = :venueId', { venueId });
    }

    const events = await queryBuilder.getMany();

    // Calculate popularity metrics
    const eventPopularity: EventPopularity[] = events.map((event) => {
      const totalBookings = event.bookings.length;
      const totalRevenue = event.bookings.reduce(
        (sum, booking) => sum + Number(booking.totalAmount),
        0
      );
      const capacityUtilizationPercentage =
        event.capacity > 0 ? (event.bookedSeats / event.capacity) * 100 : 0;

      return {
        id: event.id,
        name: event.name,
        venueId: event.venueId,
        venueName: event.venue.name,
        totalBookings,
        totalRevenue,
        capacityUtilizationPercentage,
        startDate: event.startDate,
      };
    });

    // Sort by total bookings and limit results
    return eventPopularity
      .sort((a, b) => b.totalBookings - a.totalBookings)
      .slice(0, limit);
  }

  async getCapacityUtilization(
    eventIds?: string[],
    venueId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CapacityUtilization[]> {
    // Set default date range if not provided
    const now = new Date();
    const defaultEndDate = new Date(now);
    defaultEndDate.setMonth(defaultEndDate.getMonth() + 3);
    const defaultStartDate = new Date(now);
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    // Build query
    const queryBuilder = this.eventRepository
      .createQueryBuilder('event')
      .leftJoinAndSelect('event.venue', 'venue')
      .where('event.startDate BETWEEN :startDate AND :endDate', {
        startDate: queryStartDate,
        endDate: queryEndDate,
      });

    if (eventIds && eventIds.length > 0) {
      queryBuilder.andWhere('event.id IN (:...eventIds)', { eventIds });
    }

    if (venueId) {
      queryBuilder.andWhere('event.venueId = :venueId', { venueId });
    }

    const events = await queryBuilder.getMany();

    // Calculate utilization
    return events.map((event) => {
      const utilization = event.capacity > 0 ? (event.bookedSeats / event.capacity) * 100 : 0;

      return {
        eventId: event.id,
        eventName: event.name,
        venueId: event.venueId,
        venueName: event.venue.name,
        capacity: event.capacity,
        bookedSeats: event.bookedSeats,
        utilization,
        startDate: event.startDate,
      };
    });
  }

  private generateTimeSeriesData(
    bookings: Booking[],
    startDate: Date,
    endDate: Date,
    groupBy: 'day' | 'week' | 'month'
  ) {
    const result: {
      date: string;
      bookings: number;
      revenue: number;
    }[] = [];

    // Generate date points based on grouping
    const current = new Date(startDate);
    const datePoints: Date[] = [];

    while (current <= endDate) {
      datePoints.push(new Date(current));

      switch (groupBy) {
        case 'day':
          current.setDate(current.getDate() + 1);
          break;
        case 'week':
          current.setDate(current.getDate() + 7);
          break;
        case 'month':
          current.setMonth(current.getMonth() + 1);
          break;
      }
    }

    // Create data points with zero values
    for (let i = 0; i < datePoints.length; i++) {
      const currentDate = datePoints[i];
      const nextDate = i < datePoints.length - 1 ? datePoints[i + 1] : new Date(endDate);
      
      // Format date for display
      let dateStr = '';
      switch (groupBy) {
        case 'day':
          dateStr = currentDate.toISOString().split('T')[0];
          break;
        case 'week':
          dateStr = `Week ${this.getWeekNumber(currentDate)}, ${currentDate.getFullYear()}`;
          break;
        case 'month':
          dateStr = `${currentDate.toLocaleString('default', { month: 'short' })} ${currentDate.getFullYear()}`;
          break;
      }

      // Filter bookings for this period
      const periodBookings = bookings.filter(
        (booking) => booking.createdAt >= currentDate && booking.createdAt < nextDate
      );

      const count = periodBookings.length;
      const revenue = periodBookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);

      result.push({
        date: dateStr,
        bookings: count,
        revenue,
      });
    }

    return result;
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }

  // Implement missing methods that are called from the controller

  async getEventAnalytics(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['bookings', 'venue'],
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const totalBookings = event.bookings?.length || 0;
    const confirmedBookings = event.bookings?.filter(b => b.status === BookingStatus.CONFIRMED).length || 0;
    const cancelledBookings = event.bookings?.filter(b => b.status === BookingStatus.CANCELLED).length || 0;
    
    const totalRevenue = event.bookings
      ?.filter(b => b.status === BookingStatus.CONFIRMED)
      .reduce((sum, booking) => sum + Number(booking.totalAmount), 0) || 0;
    
    const averageTicketsPerBooking = confirmedBookings > 0 
      ? (event.bookings?.filter(b => b.status === BookingStatus.CONFIRMED)
          .reduce((sum, booking) => sum + booking.numberOfTickets, 0) || 0) / confirmedBookings 
      : 0;
    
    const capacityUtilization = event.capacity > 0 
      ? (event.bookedSeats / event.capacity) * 100 
      : 0;

    return {
      totalBookings,
      confirmedBookings,
      cancelledBookings,
      totalRevenue,
      averageTicketsPerBooking,
      capacityUtilization,
    };
  }

  async getRevenueAnalytics(options: {
    startDate?: Date;
    endDate?: Date;
    eventId?: string;
    venueId?: string;
  }) {
    const { startDate, endDate, eventId, venueId } = options;

    // Set default date range if not provided
    const now = new Date();
    const defaultEndDate = new Date(now);
    const defaultStartDate = new Date(now);
    defaultStartDate.setMonth(defaultStartDate.getMonth() - 3);

    const queryStartDate = startDate || defaultStartDate;
    const queryEndDate = endDate || defaultEndDate;

    const queryBuilder = this.bookingRepository
      .createQueryBuilder('booking')
      .leftJoinAndSelect('booking.event', 'event')
      .leftJoinAndSelect('event.venue', 'venue')
      .where('booking.status = :status', { status: BookingStatus.CONFIRMED })
      .andWhere('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate: queryStartDate,
        endDate: queryEndDate,
      });

    if (eventId) {
      queryBuilder.andWhere('booking.eventId = :eventId', { eventId });
    }

    if (venueId) {
      queryBuilder.andWhere('event.venueId = :venueId', { venueId });
    }

    const bookings = await queryBuilder.getMany();

    const totalRevenue = bookings.reduce((sum, booking) => sum + Number(booking.totalAmount), 0);
    const bookingsByMonth = this.groupBookingsByPeriod(bookings, 'month');
    const bookingsByEvent = this.groupBookingsByEvent(bookings);

    return {
      totalRevenue,
      averageRevenuePerBooking: bookings.length > 0 ? totalRevenue / bookings.length : 0,
      revenueByMonth: bookingsByMonth,
      revenueByEvent: bookingsByEvent,
    };
  }

  async getUserAnalytics() {
    const userCount = await this.userRepository.count();
    const activeUsers = await this.bookingRepository
      .createQueryBuilder('booking')
      .select('booking.userId')
      .distinct(true)
      .getCount();

    const newUsersLastMonth = await this.userRepository
      .createQueryBuilder('user')
      .where('user.createdAt >= :date', { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) })
      .getCount();

    return {
      totalUsers: userCount,
      activeUsers,
      newUsersLastMonth,
      userRetentionRate: userCount > 0 ? (activeUsers / userCount) * 100 : 0,
    };
  }

  async getPopularEvents(limit = 5) {
    try {
      const events = await this.eventRepository
        .createQueryBuilder('event')
        .leftJoinAndSelect('event.bookings', 'booking')
        .leftJoinAndSelect('event.venue', 'venue')
        .where('event.status = :status', { status: 'published' })
        .andWhere('event.startDate > :now', { now: new Date() })
        .orderBy('event.bookedSeats', 'DESC')
        .take(limit)
        .getMany();

      return events.map(event => ({
        id: event.id,
        name: event.name,
        venueName: event.venue?.name || 'N/A',
        startDate: event.startDate,
        bookedSeats: event.bookedSeats || 0,
        capacity: event.capacity || 0,
        utilization: event.capacity ? ((event.bookedSeats || 0) / event.capacity) * 100 : 0,
      }));
    } catch (error) {
      console.error('Error in getPopularEvents:', error);
      // Return empty array as fallback in case of error
      return [];
    }
  }

  async getBookingTrends(period: 'day' | 'week' | 'month' = 'day', lastN = 30) {
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'day':
        startDate.setDate(startDate.getDate() - lastN);
        break;
      case 'week':
        startDate.setDate(startDate.getDate() - lastN * 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - lastN);
        break;
    }

    const bookings = await this.bookingRepository
      .createQueryBuilder('booking')
      .where('booking.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getMany();

    return this.generateTimeSeriesData(bookings, startDate, endDate, period);
  }

  async getWaitlistAnalytics(eventId: string) {
    const event = await this.eventRepository.findOne({
      where: { id: eventId },
      relations: ['waitlistEntries'],
    });

    if (!event) {
      throw new Error('Event not found');
    }

    const totalInWaitlist = event.waitlistEntries?.length || 0;
    const notifiedCount = event.waitlistEntries?.filter(w => w.notifiedAt !== null).length || 0;
    const waitingCount = event.waitlistEntries?.filter(w => w.status === 'waiting').length || 0;
    
    const potentialTickets = event.waitlistEntries?.reduce(
      (sum, entry) => sum + entry.numberOfTickets, 0
    ) || 0;

    return {
      totalInWaitlist,
      notifiedCount,
      waitingCount,
      conversionRate: notifiedCount > 0 ? ((notifiedCount - waitingCount) / notifiedCount) * 100 : 0,
      potentialTickets,
      potentialRevenue: potentialTickets * Number(event.ticketPrice),
    };
  }

  private groupBookingsByEvent(bookings: Booking[]) {
    const eventMap = new Map<string, { 
      eventId: string, 
      eventName: string, 
      bookings: number, 
      revenue: number 
    }>();

    bookings.forEach(booking => {
      const eventId = booking.eventId;
      const eventName = booking.event?.name || 'Unknown Event';
      
      if (!eventMap.has(eventId)) {
        eventMap.set(eventId, {
          eventId,
          eventName,
          bookings: 0,
          revenue: 0
        });
      }
      
      const eventStats = eventMap.get(eventId)!;
      eventStats.bookings += 1;
      eventStats.revenue += Number(booking.totalAmount);
    });

    return Array.from(eventMap.values());
  }

  private groupBookingsByPeriod(bookings: Booking[], period: 'day' | 'week' | 'month') {
    // Group similar to the time series data function
    const result: { period: string; bookings: number; revenue: number }[] = [];
    
    const periodMap = new Map<string, { bookings: number; revenue: number }>();
    
    bookings.forEach(booking => {
      const date = booking.createdAt;
      let periodKey = '';
      
      switch (period) {
        case 'day':
          periodKey = date.toISOString().split('T')[0];
          break;
        case 'week':
          periodKey = `Week ${this.getWeekNumber(date)}, ${date.getFullYear()}`;
          break;
        case 'month':
          periodKey = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
          break;
      }
      
      if (!periodMap.has(periodKey)) {
        periodMap.set(periodKey, { bookings: 0, revenue: 0 });
      }
      
      const stats = periodMap.get(periodKey)!;
      stats.bookings += 1;
      stats.revenue += Number(booking.totalAmount);
    });
    
    for (const [period, stats] of periodMap.entries()) {
      result.push({
        period,
        bookings: stats.bookings,
        revenue: stats.revenue
      });
    }
    
    return result.sort((a, b) => a.period.localeCompare(b.period));
  }
}
