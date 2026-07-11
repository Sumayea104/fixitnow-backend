import jwt from 'jsonwebtoken';
import config from '../config/env';

export interface IJwtPayload {
  id: string;
  email: string;
  role: string;
}

export const generateToken = (payload: IJwtPayload): string => {
  // Use as any to bypass the type checking issue
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as any);
};

export const verifyToken = (token: string): IJwtPayload => {
  return jwt.verify(token, config.jwt.secret) as IJwtPayload;
};