import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { BookingController } from './booking.controller';
import {
  createBookingSchema,
  updateBookingSchema,
  bookingIdSchema,
  bookingQuerySchema,
} from './booking.validation';
import { UserRole } from '../../generated/prisma';

const router = express.Router();

// ==================== All Booking Routes (Authenticated) ====================
router.use(authMiddleware);

// ==================== Customer Routes ====================
/**
 * @route   POST /api/bookings
 * @desc    Create a new booking (Customer only)
 * @access  Customer only
 */
router.post(
  '/',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(createBookingSchema),
  BookingController.createBooking
);

/**
 * @route   GET /api/bookings
 * @desc    Get user's bookings
 * @access  Authenticated (Customer/Technician)
 */
router.get(
  '/',
  validateRequest(bookingQuerySchema),
  BookingController.getUserBookings
);

/**
 * @route   GET /api/bookings/:id
 * @desc    Get booking details
 * @access  Authenticated (Customer/Technician)
 */
router.get(
  '/:id',
  validateRequest(bookingIdSchema),
  BookingController.getBookingDetails
);

/**
 * @route   PATCH /api/bookings/:id/cancel
 * @desc    Cancel booking (Customer only)
 * @access  Customer only
 */
router.patch(
  '/:id/cancel',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(bookingIdSchema),
  validateRequest(updateBookingSchema),
  BookingController.cancelBooking
);

// ==================== Technician Routes ====================
/**
 * @route   PATCH /api/bookings/:id/status
 * @desc    Update booking status (Technician only)
 * @access  Technician only
 */
router.patch(
  '/:id/status',
  roleMiddleware(UserRole.TECHNICIAN),
  validateRequest(bookingIdSchema),
  validateRequest(updateBookingSchema),
  BookingController.updateBookingStatusByTechnician
);

// ==================== Admin Routes ====================
/**
 * @route   GET /api/bookings/:id/history
 * @desc    Get booking status history (Admin only)
 * @access  Admin only
 */
router.get(
  '/:id/history',
  roleMiddleware(UserRole.ADMIN),
  validateRequest(bookingIdSchema),
  BookingController.getBookingStatusHistory
);

export default router;