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
import { UserRole } from '../../generated/prisma';

const router = express.Router();

// ==================== Public Routes ====================
/**
 * @route   GET /api/reviews
 * @desc    Get all reviews with filters
 * @access  Public
 */
router.get(
  '/',
  validateRequest(reviewQuerySchema),
  ReviewController.getAllReviews
);

/**
 * @route   GET /api/reviews/:id
 * @desc    Get review details
 * @access  Public
 */
router.get(
  '/:id',
  validateRequest(reviewIdSchema),
  ReviewController.getReviewDetails
);

/**
 * @route   GET /api/reviews/technician/:technicianId
 * @desc    Get reviews for a specific technician
 * @access  Public
 */
router.get(
  '/technician/:technicianId',
  validateRequest(reviewQuerySchema),
  ReviewController.getTechnicianReviews
);

// ==================== Protected Routes (Customer Only) ====================
router.use(authMiddleware);

/**
 * @route   POST /api/reviews
 * @desc    Create a review
 * @access  Customer only
 */
router.post(
  '/',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(createReviewSchema),
  ReviewController.createReview
);

/**
 * @route   PATCH /api/reviews/:id
 * @desc    Update a review
 * @access  Customer only
 */
router.patch(
  '/:id',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(reviewIdSchema),
  validateRequest(updateReviewSchema),
  ReviewController.updateReview
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete a review
 * @access  Customer only
 */
router.delete(
  '/:id',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(reviewIdSchema),
  ReviewController.deleteReview
);

/**
 * @route   POST /api/reviews/:id/helpful
 * @desc    Mark a review as helpful
 * @access  Authenticated users
 */
router.post(
  '/:id/helpful',
  validateRequest(reviewIdSchema),
  ReviewController.markReviewHelpful
);

// ==================== Protected Routes (Technician Only) ====================
/**
 * @route   POST /api/reviews/:id/reply
 * @desc    Reply to a review
 * @access  Technician only
 */
router.post(
  '/:id/reply',
  roleMiddleware(UserRole.TECHNICIAN),
  validateRequest(reviewIdSchema),
  validateRequest(replyToReviewSchema),
  ReviewController.replyToReview
);

export default router;