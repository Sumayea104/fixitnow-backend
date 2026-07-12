import express from 'express';
import { validateRequest } from '../../middlewares/validate';
import authMiddleware from '../../middlewares/auth';
import roleMiddleware from '../../middlewares/role';
import { PaymentController } from './payment.controller';
import { SSLController } from './ssl.controller';
import {
  createPaymentSchema,
  confirmPaymentSchema,
  paymentIdSchema,
  paymentQuerySchema,
} from './payment.validation';
import { UserRole } from '../../generated/prisma';

const router = express.Router();

// ==================== SSLCommerz Callbacks (No Auth) ====================
router.get('/ssl/success', SSLController.sslSuccess);
router.get('/ssl/fail', SSLController.sslFail);
router.get('/ssl/cancel', SSLController.sslCancel);
router.post('/ssl/ipn', SSLController.sslIPN);

// ==================== Stripe Webhook (No Auth) ====================
router.post('/webhook', express.raw({ type: 'application/json' }), PaymentController.stripeWebhook);

// ==================== Protected Routes ====================
router.use(authMiddleware);

// Stripe Payment
router.post(
  '/create',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(createPaymentSchema),
  PaymentController.createPayment
);

// SSLCommerz Payment
router.post(
  '/ssl/create',
  roleMiddleware(UserRole.CUSTOMER),
  validateRequest(createPaymentSchema),
  SSLController.createSSLCommerzPayment
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