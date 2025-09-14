import { Request } from 'express';

// Parse pagination parameters from request
export const getPaginationParams = (
  req: Request,
  defaultLimit = 10
): { page: number; limit: number; skip: number } => {
  const page = Math.max(1, parseInt(req.query.page as string) || 1);
  const limit = Math.max(1, parseInt(req.query.limit as string) || defaultLimit);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

// Parse sorting parameters from request
export const getSortingParams = (
  req: Request,
  defaultSort = 'createdAt',
  defaultOrder: 'ASC' | 'DESC' = 'DESC'
): { sort: string; order: 'ASC' | 'DESC' } => {
  const sort = (req.query.sort as string) || defaultSort;
  const order = ((req.query.order as string)?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC') as 'ASC' | 'DESC';

  return { sort, order };
};

// Filter out undefined values from an object
export const removeUndefined = <T extends Record<string, unknown>>(obj: T): Partial<T> => {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== undefined) {
      acc[key as keyof T] = value as T[keyof T];
    }
    return acc;
  }, {} as Partial<T>);
};

// Convert string IDs to array
export const parseIdArray = (ids?: string | string[]): string[] => {
  if (!ids) return [];
  return Array.isArray(ids) ? ids : [ids];
};

// Generate random alphanumeric string
export const generateRandomString = (length = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
