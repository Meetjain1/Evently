import Joi from 'joi';
import { BookingStatus } from '../models';

// Booking validation schemas
export const createBookingSchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  numberOfTickets: Joi.number().integer().min(1).required(),
  seatIds: Joi.array().items(Joi.string().uuid()),
});

export const updateBookingSchema = Joi.object({
  status: Joi.string().valid(...Object.values(BookingStatus)),
  cancellationReason: Joi.string().trim(),
});

export const getBookingsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  eventId: Joi.string().uuid(),
  userId: Joi.string().uuid(),
  status: Joi.string().valid(...Object.values(BookingStatus)),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  sort: Joi.string().valid('createdAt', 'numberOfTickets', 'totalAmount').default('createdAt'),
  order: Joi.string().valid('ASC', 'DESC').default('DESC'),
});
