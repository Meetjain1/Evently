import jwt from 'jsonwebtoken';
import config from '../config';
import { User } from '../models';

// Generate JWT token
export const generateToken = (user: User): string => {
  const payload = {
    id: user.id,
    role: user.role,
  };

  // TypeScript is having trouble with the jwt.sign types, but this is correct
  // @ts-ignore
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
};

// Sanitize user data before sending to client
export const sanitizeUser = (user: User): Partial<User> => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, ...sanitizedUser } = user;
  return sanitizedUser;
};
