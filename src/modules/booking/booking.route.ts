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

/**
 * @openapi
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Creates a booking for a customer to book a service from a technician. The booking status starts as REQUESTED.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - scheduledDate
 *               - scheduledTime
 *             properties:
 *               serviceId:
 *                 type: string
 *                 format: uuid
 *                 example: cmri8lbd000012243qh35lwhe
 *               scheduledDate:
 *                 type: string
 *                 format: date-time
 *                 example: 2026-07-30T00:00:00.000Z
 *               scheduledTime:
 *                 type: string
 *                 pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$
 *                 example: 14:30
 *               durationMinutes:
 *                 type: integer
 *                 example: 60
 *               notes:
 *                 type: string
 *                 maxLength: 500
 *                 example: Please bring your own tools
 *     responses:
 *       201:
 *         description: Booking created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Booking created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     bookingNumber:
 *                       type: string
 *                       example: BK-2026-0001
 *                     status:
 *                       type: string
 *                       enum: [REQUESTED, ACCEPTED, DECLINED, PAID, IN_PROGRESS, COMPLETED, CANCELLED]
 *                       example: REQUESTED
 *                     totalPrice:
 *                       type: number
 *                       example: 150
 *       400:
 *         description: Validation error or business rule violation
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Cannot book own service
 *       404:
 *         description: Service not found
 *       409:
 *         description: Time slot already booked
 */
router.post(
  '/',
  authMiddleware,
  validateRequest(createBookingSchema),
  BookingController.createBooking
);

/**
 * @openapi
 * /api/bookings:
 *   get:
 *     summary: Get current user's bookings
 *     description: Returns a paginated list of bookings for the authenticated user.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [REQUESTED, ACCEPTED, DECLINED, PAID, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter bookings by status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Items per page
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           default: createdAt
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Bookings retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       bookingNumber:
 *                         type: string
 *                       status:
 *                         type: string
 *                       totalPrice:
 *                         type: number
 *                       scheduledDate:
 *                         type: string
 *                         format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  authMiddleware,
  validateRequest(bookingQuerySchema),
  BookingController.getUserBookings
);

/**
 * @openapi
 * /api/bookings/{id}:
 *   get:
 *     summary: Get booking details by ID
 *     description: Returns detailed information about a specific booking.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     responses:
 *       200:
 *         description: Booking details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     bookingNumber:
 *                       type: string
 *                     status:
 *                       type: string
 *                     totalPrice:
 *                       type: number
 *                     customer:
 *                       type: object
 *                     technician:
 *                       type: object
 *                     service:
 *                       type: object
 *                     payment:
 *                       type: object
 *                       nullable: true
 *                     review:
 *                       type: object
 *                       nullable: true
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You do not have access to this booking
 *       404:
 *         description: Booking not found
 */
router.get(
  '/:id',
  authMiddleware,
  validateRequest(bookingIdSchema),
  BookingController.getBookingDetails
);

/**
 * @openapi
 * /api/bookings/{id}/cancel:
 *   patch:
 *     summary: Cancel a booking
 *     description: Cancels a booking. Only the customer can cancel their own booking. Cannot cancel if status is IN_PROGRESS or COMPLETED.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *                 maxLength: 200
 *                 example: Change of plans
 *     responses:
 *       200:
 *         description: Booking cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Booking cancelled successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: CANCELLED
 *       400:
 *         description: Cannot cancel booking
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - You can only cancel your own bookings
 *       404:
 *         description: Booking not found
 */
router.patch(
  '/:id/cancel',
  authMiddleware,
  validateRequest(bookingIdSchema),
  validateRequest(cancelBookingSchema),
  BookingController.cancelBooking
);

/**
 * @openapi
 * /api/bookings/{id}/status:
 *   patch:
 *     summary: Update booking status (Technician only)
 *     description: Allows a technician to accept, decline, start, or complete a booking.
 *     tags:
 *       - Bookings
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Booking ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, DECLINED, IN_PROGRESS, COMPLETED]
 *                 example: ACCEPTED
 *     responses:
 *       200:
 *         description: Booking status updated successfully
 *       400:
 *         description: Invalid status transition
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not your booking
 *       404:
 *         description: Booking not found
 */
router.patch(
  '/:id/status',
  authMiddleware,
  roleMiddleware(UserRole.TECHNICIAN),
  validateRequest(bookingIdSchema),
  validateRequest(updateBookingStatusSchema),
  BookingController.updateBookingStatus
);

export default router;