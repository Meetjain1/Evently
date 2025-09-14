import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';

// Validation middleware creator
export const validate = (schema: Schema, property: 'body' | 'query' | 'params' = 'body') => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (!error) {
      return next();
    }

    const errors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
    }));

    return res.status(400).json({
      message: 'Validation error',
      errors,
    });
  };
};
