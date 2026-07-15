import { Request } from 'express';
import { UserRole } from '../generated/prisma';

export interface IJwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface IAuthRequest extends Request {
  user?: IJwtPayload;
}

export interface IApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}