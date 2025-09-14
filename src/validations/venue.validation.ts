import Joi from 'joi';

// Venue validation schemas
export const createVenueSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100).required(),
  address: Joi.string().trim().min(5).max(200).required(),
  city: Joi.string().trim().min(2).max(100).required(),
  state: Joi.string().trim().min(2).max(100).required(),
  zipCode: Joi.string().trim().min(5).max(20).required(),
  country: Joi.string().trim().min(2).max(100).required(),
  totalCapacity: Joi.number().integer().min(1).required(),
  hasSeating: Joi.boolean().default(false),
  description: Joi.string().trim().allow('').allow(null),
});

export const updateVenueSchema = Joi.object({
  name: Joi.string().trim().min(3).max(100),
  address: Joi.string().trim().min(5).max(200),
  city: Joi.string().trim().min(2).max(100),
  state: Joi.string().trim().min(2).max(100),
  zipCode: Joi.string().trim().min(5).max(20),
  country: Joi.string().trim().min(2).max(100),
  totalCapacity: Joi.number().integer().min(1),
  hasSeating: Joi.boolean(),
  description: Joi.string().trim().allow('').allow(null),
});

export const getVenuesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow(''),
  city: Joi.string().trim(),
  state: Joi.string().trim(),
  country: Joi.string().trim(),
  hasSeating: Joi.boolean(),
  minCapacity: Joi.number().integer().min(1),
  maxCapacity: Joi.number().integer().min(Joi.ref('minCapacity')),
  sort: Joi.string().valid('name', 'totalCapacity', 'createdAt').default('name'),
  order: Joi.string().valid('ASC', 'DESC').default('ASC'),
});
