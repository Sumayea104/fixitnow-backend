import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import PaymentService from './payment.service';

// ==================== Create Payment ====================
const createPayment = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const { bookingId, provider } = req.body;
  const result = await PaymentService.createPayment(userId, bookingId, provider);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Payment created successfully',
    data: result,
  });
});

// ==================== Confirm Payment ====================
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await PaymentService.confirmPayment(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment confirmed successfully',
    data: result,
  });
});

// ==================== Get Payment History ====================
const getPaymentHistory = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await PaymentService.getPaymentHistory(userId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result.payments,
    meta: result.meta,
  });
});

// ==================== Get Payment Details ====================
const getPaymentDetails = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await PaymentService.getPaymentDetails(id, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment details retrieved successfully',
    data: result,
  });
});

// ==================== Stripe Webhook ====================
const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const result = await PaymentService.handleStripeWebhook(req.body, sig);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Webhook received',
    data: result,
  });
});

// ==================== Export ====================
export const PaymentController = {
  createPayment,
  confirmPayment,
  getPaymentHistory,
  getPaymentDetails,
  stripeWebhook,
};

export default PaymentController;