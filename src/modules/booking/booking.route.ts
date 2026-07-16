import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { BookingController } from './booking.controller';
import {
  createBookingSchema,
  updateBookingStatusSchema,
  cancelBookingSchema,
  bookingIdSchema,
  bookingQuerySchema,
} from './booking.validation';
import { UserRole } from '@prisma/client';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// ==================== Customer Routes ====================
// Create booking (Customer only)
router.post(
  '/',
  validateRequest(createBookingSchema),
  BookingController.createBooking
);

// Get user's bookings
router.get(
  '/',
  validateRequest(bookingQuerySchema),
  BookingController.getUserBookings
);

// Get booking details
router.get(
  '/:id',
  validateRequest(bookingIdSchema),
  BookingController.getBookingDetails
);

// Cancel booking (Customer only)
router.patch(
  '/:id/cancel',
  validateRequest(bookingIdSchema),
  validateRequest(cancelBookingSchema),
  BookingController.cancelBooking
);

// ==================== Technician Routes ====================
// Update booking status (Technician only)
router.patch(
  '/:id/status',
  validateRequest(bookingIdSchema),
  validateRequest(updateBookingStatusSchema),
  roleMiddleware(UserRole.TECHNICIAN),
  BookingController.updateBookingStatus
);

// ==================== Admin Routes ====================
// Get booking history (Admin only)
router.get(
  '/:id/history',
  validateRequest(bookingIdSchema),
  roleMiddleware(UserRole.ADMIN),
  BookingController.getBookingHistory
);

export default router;
