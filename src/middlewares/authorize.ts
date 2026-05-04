import { Request, Response, NextFunction } from 'express';
import { UserRole } from '../types/user.types';
import { ForbiddenError, UnauthorizedError } from '../errors';

export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('Authentication required.'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(new ForbiddenError('You do not have permission to access this resource.'));
      return;
    }

    next();
  };
}