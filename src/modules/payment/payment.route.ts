import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { PaymentController } from './payment.controller';
import {
  createPaymentSchema,
  confirmPaymentSchema,
  paymentIdSchema,
  paymentQuerySchema,
} from './payment.validation';
import { UserRole } from '@prisma/client';

const router = express.Router();

// ==================== Protected Routes ====================
router.use(authMiddleware);

/**
 * @openapi
 * /api/payments/create:
 *   post:
 *     summary: Create a payment
 *     description: Creates a payment intent for a booking using Stripe or SSLCommerz
 *     tags: [Payments]
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
 *               - provider
 *             properties:
 *               bookingId:
 *                 type: string
 *                 format: uuid
 *                 example: cmrtuvenz0002rvv6j7mlpymz
 *               provider:
 *                 type: string
 *                 enum: [STRIPE, SSLCOMMERZ]
 *                 example: STRIPE
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Booking not found
 *       409:
 *         description: Payment already exists
 */
router.post(
  '/create',
  validateRequest(createPaymentSchema),
  PaymentController.createPayment
);

/**
 * @openapi
 * /api/payments:
 *   get:
 *     summary: Get payment history
 *     description: Returns a paginated list of payments for the authenticated user
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, COMPLETED, FAILED]
 *       - in: query
 *         name: provider
 *         schema:
 *           type: string
 *           enum: [STRIPE, SSLCOMMERZ]
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get(
  '/',
  validateRequest(paymentQuerySchema),
  PaymentController.getPaymentHistory
);

/**
 * @openapi
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment details
 *     description: Returns detailed information about a specific payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Payment not found
 */
router.get(
  '/:id',
  validateRequest(paymentIdSchema),
  PaymentController.getPaymentDetails
);

/**
 * @openapi
 * /api/payments/confirm/{id}:
 *   patch:
 *     summary: Confirm payment
 *     description: Confirms a payment status (webhook or manual)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
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
 *                 enum: [COMPLETED, FAILED]
 *               paymentIntentId:
 *                 type: string
 *               transactionId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       404:
 *         description: Payment not found
 */
router.patch(
  '/confirm/:id',
  roleMiddleware(UserRole.ADMIN),
  validateRequest(paymentIdSchema),
  validateRequest(confirmPaymentSchema),
  PaymentController.confirmPayment
);

export default router;