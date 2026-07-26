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

/**
 * @openapi
 * /api/reviews:
 *   get:
 *     summary: Get all reviews with filters
 *     description: Returns a paginated list of reviews with optional filters.
 *     tags: [Reviews]
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
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating
 *     responses:
 *       200:
 *         description: Reviews retrieved successfully
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
 *                   example: Reviews retrieved successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       rating:
 *                         type: integer
 *                       comment:
 *                         type: string
 *                       customer:
 *                         type: object
 *                       technician:
 *                         type: object
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
 */
router.get(
  '/',
  validateRequest(reviewQuerySchema),
  ReviewController.getAllReviews
);

/**
 * @openapi
 * /api/reviews/{id}:
 *   get:
 *     summary: Get review details by ID
 *     description: Returns detailed information about a specific review.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review details retrieved successfully
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
 *                   example: Review details retrieved successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     comment:
 *                       type: string
 *                     reply:
 *                       type: string
 *                     customer:
 *                       type: object
 *                     technician:
 *                       type: object
 *       404:
 *         description: Review not found
 */
router.get(
  '/:id',
  validateRequest(reviewIdSchema),
  ReviewController.getReviewDetails
);

/**
 * @openapi
 * /api/reviews/technician/{technicianId}:
 *   get:
 *     summary: Get all reviews for a technician
 *     description: Returns a paginated list of reviews for a specific technician.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Technician ID
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
 *         description: Reviews retrieved successfully
 *       404:
 *         description: Technician not found
 */
router.get(
  '/technician/:technicianId',
  validateRequest(reviewQuerySchema),
  ReviewController.getTechnicianReviews
);

// ==================== Protected Routes ====================
router.use(authMiddleware);

/**
 * @openapi
 * /api/reviews:
 *   post:
 *     summary: Create a review
 *     description: Creates a review for a completed booking. Customer only.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bookingId
 *               - rating
 *             properties:
 *               bookingId:
 *                 type: string
 *                 format: uuid
 *                 example: cmrtuvenz0002rvv6j7mlpymz
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *                 example: Great service! Very professional.
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["https://example.com/photo1.jpg"]
 *     responses:
 *       201:
 *         description: Review created successfully
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
 *                   example: Review created successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     comment:
 *                       type: string
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer only
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Review already exists for this booking
 */
router.post(
  '/',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(createReviewSchema),
  ReviewController.createReview
);

/**
 * @openapi
 * /api/reviews/{id}:
 *   patch:
 *     summary: Update a review
 *     description: Updates an existing review. Customer only.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Review ID
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *               comment:
 *                 type: string
 *                 maxLength: 500
 *     responses:
 *       200:
 *         description: Review updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer only
 *       404:
 *         description: Review not found
 */
router.patch(
  '/:id',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(reviewIdSchema),
  validateRequest(updateReviewSchema),
  ReviewController.updateReview
);

/**
 * @openapi
 * /api/reviews/{id}:
 *   delete:
 *     summary: Delete a review
 *     description: Deletes a review. Customer only.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Customer only
 *       404:
 *         description: Review not found
 */
router.delete(
  '/:id',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(reviewIdSchema),
  ReviewController.deleteReview
);

/**
 * @openapi
 * /api/reviews/{id}/helpful:
 *   post:
 *     summary: Mark a review as helpful
 *     description: Marks a review as helpful. Public endpoint.
 *     tags: [Reviews]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Review ID
 *     responses:
 *       200:
 *         description: Review marked as helpful
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
 *                   example: Review marked as helpful
 *                 data:
 *                   type: object
 *                   properties:
 *                     helpfulCount:
 *                       type: integer
 *       404:
 *         description: Review not found
 */
router.post(
  '/:id/helpful',
  validateRequest(reviewIdSchema),
  ReviewController.markReviewHelpful
);

/**
 * @openapi
 * /api/reviews/{id}/reply:
 *   post:
 *     summary: Reply to a review
 *     description: Adds a technician reply to a review. Technician only.
 *     tags: [Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Review ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - reply
 *             properties:
 *               reply:
 *                 type: string
 *                 maxLength: 500
 *                 example: Thank you for your feedback!
 *     responses:
 *       200:
 *         description: Reply added successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Technician only
 *       404:
 *         description: Review not found
 */
router.post(
  '/:id/reply',
  roleMiddleware(UserRole.TECHNICIAN),
  validateRequest(reviewIdSchema),
  validateRequest(replyToReviewSchema),
  ReviewController.replyToReview
);

export default router;