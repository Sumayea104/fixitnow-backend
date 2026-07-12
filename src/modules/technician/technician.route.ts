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
import { UserRole } from '../../generated/prisma';

const router = express.Router();

router.get(
  '/',
  validateRequest(technicianQuerySchema),
  TechnicianController.getAllTechnicians
);

router.use(authMiddleware);
router.use(roleMiddleware(UserRole.TECHNICIAN));

router.get(
  '/stats',
  TechnicianController.getTechnicianStats
);

router.get(
  '/bookings',
  TechnicianController.getTechnicianBookings
);

router.put(
  '/profile',
  validateRequest(updateTechnicianProfileSchema),
  TechnicianController.updateTechnicianProfile
);

router.put(
  '/availability',
  validateRequest(updateAvailabilitySchema),
  TechnicianController.updateAvailabilitySlots
);

router.patch(
  '/bookings/:id',
  validateRequest(bookingIdSchema),
  validateRequest(updateBookingStatusSchema),
  TechnicianController.updateBookingStatus
);

router.get(
  '/:id',
  validateRequest(technicianIdSchema),
  TechnicianController.getTechnicianProfile
);

export default router;