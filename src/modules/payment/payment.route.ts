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
import { UserRole } from '../../generated/prisma';

const router = express.Router();

// Webhook (No Auth)
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.stripeWebhook);

// Protected Routes
router.use(authMiddleware);

router.post(
  '/create',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(createPaymentSchema),
  PaymentController.createPayment
);

router.patch(
  '/:id/confirm',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(paymentIdSchema),
  validateRequest(confirmPaymentSchema),
  PaymentController.confirmPayment
);

router.get(
  '/',
  validateRequest(paymentQuerySchema),
  PaymentController.getPaymentHistory
);

router.get(
  '/:id',
  validateRequest(paymentIdSchema),
  PaymentController.getPaymentDetails
);

export default router;