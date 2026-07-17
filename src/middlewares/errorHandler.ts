import { ErrorRequestHandler, Request, Response, NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ZodError } from 'zod';
import config from '../config/env';
import AppError from '../errors/AppError';

const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction 
): void => {
  let statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  let message = err.message || 'Something went wrong!';
  let errorDetails = err;

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    statusCode = StatusCodes.BAD_REQUEST;
    message = err.issues.map((issue) => 
      `${issue.path[issue.path.length - 1]} is ${issue.message}`
    ).join(', ');
    errorDetails = err.issues;
  }
  // Handle Custom App Errors
  else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    errorDetails = err;
  }
  // Handle Prisma Known Errors
  else if (err.name === 'PrismaClientKnownRequestError') {
    statusCode = StatusCodes.BAD_REQUEST;
    
    switch (err.code) {
      case 'P2000':
        message = 'Value too long for field';
        break;
      case 'P2001':
        statusCode = StatusCodes.NOT_FOUND;
        message = 'Record not found';
        break;
      case 'P2002':
        statusCode = StatusCodes.CONFLICT;
        const field = err.meta?.target as string[];
        message = `Duplicate value for ${field ? field.join(', ') : 'field'}`;
        break;
      case 'P2003':
        message = 'Invalid reference to another record';
        break;
      case 'P2014':
        message = 'Invalid ID provided';
        break;
      case 'P2015':
        statusCode = StatusCodes.NOT_FOUND;
        message = 'Related record not found';
        break;
      case 'P2025':
        statusCode = StatusCodes.NOT_FOUND;
        message = 'Record not found';
        break;
      default:
        message = err.message;
    }
    errorDetails = err;
  }
  // Handle Prisma Validation Errors
  else if (err.name === 'PrismaClientValidationError') {
    statusCode = StatusCodes.BAD_REQUEST;
    message = 'Invalid data provided';
    errorDetails = err;
  }
  // Handle JWT Errors
  else if (err.name === 'JsonWebTokenError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Invalid authentication token';
    errorDetails = err;
  }
  else if (err.name === 'TokenExpiredError') {
    statusCode = StatusCodes.UNAUTHORIZED;
    message = 'Authentication token has expired';
    errorDetails = err;
  }

  // Log error for debugging
  console.error('Error:', {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    statusCode,
    message,
    error: err.message,
  });

  res.status(statusCode).json({
    success: false,
    message,
    errorDetails: config.nodeEnv === 'development' ? errorDetails : undefined,
    stack: config.nodeEnv === 'development' ? err.stack : undefined,
  });
};

export default errorHandler;
