import { Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { UserRole } from '../generated/prisma';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';

const roleMiddleware = (...allowedRoles: UserRole[]) => {
  return catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not authenticated');
    }

    if (!allowedRoles.includes(req.user.role)) {
      throw new AppError(StatusCodes.FORBIDDEN, 'You do not have permission to perform this action');
    }

    next();
  });
};

export default roleMiddleware; 