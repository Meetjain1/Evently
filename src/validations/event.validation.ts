import Joi from 'joi';
import { EventStatus } from '../models';

// Event validation schemas
export const createEventSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  description: Joi.string().trim().required(),
  startDate: Joi.date().iso().greater('now').required(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')).required(),
  capacity: Joi.number().integer().min(1).required(),
  isFeatured: Joi.boolean().default(false),
  status: Joi.string()
    .valid(...Object.values(EventStatus))
    .default(EventStatus.DRAFT),
  ticketPrice: Joi.number().precision(2).min(0).required(),
  hasWaitlist: Joi.boolean().default(false),
  maxWaitlistSize: Joi.number().integer().min(0).default(0),
  hasSeating: Joi.boolean().default(false),
  venueId: Joi.string().uuid().required(),
});

export const updateEventSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100),
  description: Joi.string().trim(),
  startDate: Joi.date().iso().greater('now'),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')),
  capacity: Joi.number().integer().min(1),
  isFeatured: Joi.boolean(),
  status: Joi.string().valid(...Object.values(EventStatus)),
  ticketPrice: Joi.number().precision(2).min(0),
  hasWaitlist: Joi.boolean(),
  maxWaitlistSize: Joi.number().integer().min(0),
  hasSeating: Joi.boolean(),
  venueId: Joi.string().uuid(),
});

export const getEventsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  status: Joi.string().valid(...Object.values(EventStatus)),
  isFeatured: Joi.boolean(),
  hasWaitlist: Joi.boolean(),
  venueId: Joi.string().uuid(),
  sort: Joi.string().valid('startDate', 'capacity', 'bookedSeats', 'createdAt').default('startDate'),
  order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});
