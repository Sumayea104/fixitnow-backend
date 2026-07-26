import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { TechnicianController } from './technician.controller';
import {
  updateTechnicianProfileSchema,
  updateAvailabilitySchema,
  updateBookingStatusSchema,
  technicianIdSchema,
  bookingIdSchema,
  technicianQuerySchema,
} from './technician.validation';
import { UserRole } from '@prisma/client';

const router = express.Router();

/**
 * @openapi
 * /api/technicians:
 *   get:
 *     summary: Get all technicians with filters
 *     description: Returns a paginated list of technicians with optional filters for service, location, rating, and availability.
 *     tags:
 *       - Technicians
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: service
 *         schema:
 *           type: string
 *         description: Filter by service type
 *       - in: query
 *         name: location
 *         schema:
 *           type: string
 *         description: Filter by location
 *       - in: query
 *         name: minRating
 *         schema:
 *           type: number
 *           minimum: 0
 *           maximum: 5
 *         description: Minimum rating filter
 *       - in: query
 *         name: isAvailable
 *         schema:
 *           type: boolean
 *         description: Filter by availability
 *     responses:
 *       200:
 *         description: Technicians retrieved successfully
 */
router.get(
  '/',
  validateRequest(technicianQuerySchema),
  TechnicianController.getAllTechnicians
);

/**
 * @openapi
 * /api/technicians/{id}:
 *   get:
 *     summary: Get technician profile by ID
 *     description: Returns detailed information about a technician including their services, availability, and reviews.
 *     tags:
 *       - Technicians
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Technician profile ID
 *     responses:
 *       200:
 *         description: Technician profile retrieved successfully
 *       404:
 *         description: Technician not found
 */
router.get(
  '/:id',
  validateRequest(technicianIdSchema),
  TechnicianController.getTechnicianProfile
);

// ==================== PROTECTED ROUTES ====================
router.use(authMiddleware);
router.use(roleMiddleware(UserRole.TECHNICIAN));

/**
 * @openapi
 * /api/technicians/profile:
 *   put:
 *     summary: Update technician profile
 *     description: Updates the authenticated technician's profile information.
 *     tags:
 *       - Technicians
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bio:
 *                 type: string
 *                 maxLength: 500
 *                 example: Experienced plumber with 10+ years
 *               experience:
 *                 type: integer
 *                 minimum: 0
 *                 example: 10
 *               hourlyRate:
 *                 type: number
 *                 minimum: 0
 *                 example: 75
 *               location:
 *                 type: string
 *                 example: Dhaka, Bangladesh
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Plumbing", "Pipe Repair"]
 *               isAvailable:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Technician only
 *       404:
 *         description: Technician profile not found
 */
router.put(
  '/profile',
  validateRequest(updateTechnicianProfileSchema),
  TechnicianController.updateTechnicianProfile
);

/**
 * @openapi
 * /api/technicians/availability:
 *   put:
 *     summary: Update technician availability slots
 *     description: Sets the weekly availability schedule for the technician.
 *     tags:
 *       - Technicians
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               availabilitySlots:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     dayOfWeek:
 *                       type: integer
 *                       minimum: 0
 *                       maximum: 6
 *                       example: 1
 *                     startTime:
 *                       type: string
 *                       pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$
 *                       example: 09:00
 *                     endTime:
 *                       type: string
 *                       pattern: ^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$
 *                       example: 17:00
 *                     isRecurring:
 *                       type: boolean
 *                       default: true
 *                     maxBookings:
 *                       type: integer
 *                       default: 1
 *     responses:
 *       200:
 *         description: Availability updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Technician only
 *       404:
 *         description: Technician profile not found
 */
router.put(
  '/availability',
  validateRequest(updateAvailabilitySchema),
  TechnicianController.updateAvailabilitySlots
);

/**
 * @openapi
 * /api/technicians/bookings:
 *   get:
 *     summary: Get technician's bookings
 *     description: Returns all bookings assigned to the authenticated technician.
 *     tags:
 *       - Technicians
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [REQUESTED, ACCEPTED, DECLINED, PAID, IN_PROGRESS, COMPLETED, CANCELLED]
 *         description: Filter by booking status
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Bookings retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Technician only
 */
router.get(
  '/bookings',
  TechnicianController.getTechnicianBookings
);

/**
 * @openapi
 * /api/technicians/bookings/{id}:
 *   patch:
 *     summary: Update booking status (Technician)
 *     description: Allows a technician to accept, decline, start, or complete a booking.
 *     tags:
 *       - Technicians
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
  '/bookings/:id',
  validateRequest(bookingIdSchema),
  validateRequest(updateBookingStatusSchema),
  TechnicianController.updateBookingStatus
);

/**
 * @openapi
 * /api/technicians/stats:
 *   get:
 *     summary: Get technician statistics
 *     description: Returns statistics for the authenticated technician including booking counts, revenue, and service counts.
 *     tags:
 *       - Technicians
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Technician only
 *       404:
 *         description: Technician profile not found
 */
router.get(
  '/stats',
  TechnicianController.getTechnicianStats
);

export default router;