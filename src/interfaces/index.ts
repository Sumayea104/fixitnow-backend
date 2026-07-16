import { Request } from 'express';
import { UserRole } from '../generated/prisma';

export interface IJwtPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface IUserPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: string;
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
    totalPages: number;
  };
}

export interface IPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ILoginResponse {
  user: IUserPayload;
  token: string;
}

export interface IRegisterResponse {
  user: IUserPayload;
  token: string;
}
