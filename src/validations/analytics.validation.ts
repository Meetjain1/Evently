import Joi from 'joi';

// Analytics validation schemas
export const getBookingAnalyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')),
  eventId: Joi.string().uuid(),
  venueId: Joi.string().uuid(),
  groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
});

export const getEventAnalyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')),
  limit: Joi.number().integer().min(1).max(100).default(10),
  venueId: Joi.string().uuid(),
});

export const getCapacityUtilizationQuerySchema = Joi.object({
  eventIds: Joi.array().items(Joi.string().uuid()),
  venueId: Joi.string().uuid(),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso().greater(Joi.ref('startDate')),
});
