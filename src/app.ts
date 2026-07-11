import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { StatusCodes } from 'http-status-codes';

import authRoutes from './modules/auth/auth.route';
import { errorHandler } from './middlewares';  // ← Changed from './middleware' to './middlewares'
import AppError from './errors/AppError';
import config from './config/env';

const app: Application = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: '🚀 FixItNow API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new AppError(StatusCodes.NOT_FOUND, `Route ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

export default app;