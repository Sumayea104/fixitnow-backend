import { Request } from 'express';

export interface IUserPayload {
  id: string;
  email: string;
  role: string;
}

export interface IAuthRequest extends Request {
  user?: IUserPayload;
}