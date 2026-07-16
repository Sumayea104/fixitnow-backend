import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { StatusCodes } from 'http-status-codes';
import { config } from '../config/env';

import { UserRole } from '../generated/prisma';
import { IJwtPayload } from '../interfaces';
import AppError from '../errors/AppError';
import catchAsync from '../utils/catchAsync';

declare global {
  namespace Express {
    interface Request {
      user?: IJwtPayload;
    }
  }
}

const authMiddleware = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'You are not logged in');
  }

  const decoded = jwt.verify(token, config.jwt.secret) as {
    id: string;
    email: string;
    role: UserRole;  
  };
  
  req.user = decoded;
  next();
});

export default authMiddleware;