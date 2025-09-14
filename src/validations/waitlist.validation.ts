import Joi from 'joi';
import { WaitlistStatus } from '../models';

// Waitlist validation schemas
export const createWaitlistEntrySchema = Joi.object({
  eventId: Joi.string().uuid().required(),
  numberOfTickets: Joi.number().integer().min(1).required(),
});

// Alias for createWaitlistEntrySchema (for route compatibility)
export const joinWaitlistSchema = createWaitlistEntrySchema;

export const updateWaitlistEntrySchema = Joi.object({
  status: Joi.string().valid(...Object.values(WaitlistStatus)),
  notifiedAt: Joi.date().iso(),
});

export const getWaitlistEntriesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  eventId: Joi.string().uuid(),
  userId: Joi.string().uuid(),
  status: Joi.string().valid(...Object.values(WaitlistStatus)),
  sort: Joi.string().valid('position', 'createdAt', 'numberOfTickets').default('position'),
  order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});
