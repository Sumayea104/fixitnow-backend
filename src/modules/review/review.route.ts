import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { ReviewController } from './review.controller';
import {
  createReviewSchema,
  updateReviewSchema,
  replyToReviewSchema,
  reviewIdSchema,
  reviewQuerySchema,
} from './review.validation';
import { UserRole } from '@prisma/client';

const router = express.Router();

router.get(
  '/',
  validateRequest(reviewQuerySchema),
  ReviewController.getAllReviews
);

router.get(
  '/:id',
  validateRequest(reviewIdSchema),
  ReviewController.getReviewDetails
);

router.get(
  '/technician/:technicianId',
  validateRequest(reviewQuerySchema),
  ReviewController.getTechnicianReviews
);

// ==================== Protected Routes (Customer Only) ====================
router.use(authMiddleware);

router.post(
  '/',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(createReviewSchema),
  ReviewController.createReview
);

router.patch(
  '/:id',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(reviewIdSchema),
  validateRequest(updateReviewSchema),
  ReviewController.updateReview
);

router.delete(
  '/:id',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(reviewIdSchema),
  ReviewController.deleteReview
);

router.post(
  '/:id/helpful',
  validateRequest(reviewIdSchema),
  ReviewController.markReviewHelpful
);

router.post(
  '/:id/reply',
  roleMiddleware(UserRole.TECHNICIAN),
  validateRequest(reviewIdSchema),
  validateRequest(replyToReviewSchema),
  ReviewController.replyToReview
);

export default router;
