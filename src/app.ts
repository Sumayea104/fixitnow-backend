import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { StatusCodes } from 'http-status-codes';

import authRoutes from './modules/auth/auth.route';
import userRoutes from './modules/user/user.route';
import technicianRoutes from './modules/technician/technician.route';
import bookingRoutes from './modules/booking/booking.route';
import paymentRoutes from './modules/payment/payment.route';
import reviewRoutes from './modules/review/review.route';
import serviceRoutes from './modules/service/service.route';
import categoryRoutes from './modules/category/category.route';
import adminRoutes from './modules/admin/admin.route';

import errorHandler from './middleware/errorHandler';
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
app.use('/api/users', userRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/admin', adminRoutes);

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