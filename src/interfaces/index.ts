import { Request } from 'express';
import { UserRole } from '../generated/prisma';
export interface IUserPayload {
  id: string;
  email: string;
  role: UserRole;
}

export interface IAuthRequest extends Request {
  user?: IUserPayload;
}