import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { StatusCodes } from 'http-status-codes';

import authRoutes from './modules/auth/auth.route';
import adminRoutes from './modules/admin/admin.route';
import technicianRoutes from './modules/technician/technician.route';
import serviceRoutes from './modules/service/service.route';
import categoryRoutes from './modules/category/category.route';
import bookingRoutes from './modules/booking/booking.route';
import paymentRoutes from './modules/payment/payment.route';
import reviewRoutes from './modules/review/review.route';

import { errorHandler } from './middlewares';
import AppError from './errors/AppError';
import config from './config/env';
import { setupSwagger } from './swagger';

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

// Swagger Documentation
setupSwagger(app);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);

// ==================== ROOT ROUTE ====================
app.get('/', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: '🚀 FixItNow API is running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      admin: '/api/admin',
      technicians: '/api/technicians',
      services: '/api/services',
      categories: '/api/categories',
      bookings: '/api/bookings',
      payments: '/api/payments',
      reviews: '/api/reviews',
      docs: '/api-docs',
    },
    environment: config.nodeEnv,
  });
});

// Health check
app.get('/health', (_req: Request, res: Response) => {
  res.status(StatusCodes.OK).json({
    success: true,
    message: '🚀 FixItNow API is running',
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
  });
});

// Favicon
app.get('/favicon.ico', (_req: Request, res: Response) => {
  res.status(204).end();
});

// 404 handler
app.use((req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(StatusCodes.NOT_FOUND, `Route ${req.originalUrl} not found`));
});

// Global error handler
app.use(errorHandler);

export default app;