import Joi from 'joi';
import { SeatStatus } from '../models';

// Seat validation schemas
export const createSeatSchema = Joi.object({
  row: Joi.string().trim().max(10).required(),
  seatNumber: Joi.number().integer().min(1).required(),
  status: Joi.string()
    .valid(...Object.values(SeatStatus))
    .default(SeatStatus.AVAILABLE),
  isActive: Joi.boolean().default(true),
  notes: Joi.string().trim().allow('').allow(null),
  venueId: Joi.string().uuid().required(),
  eventId: Joi.string().uuid().allow(null),
});

// Bulk seat creation schema
export const createBulkSeatsSchema = Joi.object({
  startRow: Joi.string().trim().max(10).required(),
  endRow: Joi.string().trim().max(10).required(),
  seatsPerRow: Joi.number().integer().min(1).required(),
  section: Joi.string().trim().allow('').allow(null),
  isAccessible: Joi.boolean().default(false),
  notes: Joi.string().trim().allow('').allow(null),
  eventId: Joi.string().uuid().allow(null),
});

export const updateSeatSchema = Joi.object({
  row: Joi.string().trim().max(10),
  seatNumber: Joi.number().integer().min(1),
  status: Joi.string().valid(...Object.values(SeatStatus)),
  isActive: Joi.boolean(),
  notes: Joi.string().trim().allow('').allow(null),
  eventId: Joi.string().uuid().allow(null),
});

export const getSeatsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(500).default(100),
  venueId: Joi.string().uuid(),
  eventId: Joi.string().uuid(),
  status: Joi.string().valid(...Object.values(SeatStatus)),
  isActive: Joi.boolean(),
  row: Joi.string().trim().max(10),
  sort: Joi.string().valid('row', 'seatNumber').default('row'),
  order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});
