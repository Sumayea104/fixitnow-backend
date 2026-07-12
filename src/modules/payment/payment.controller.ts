import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import PaymentService from './payment.service';

const createPayment = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const customerId = req.user.id;
  const { bookingId, provider } = req.body;
  const result = await PaymentService.createPayment(customerId, bookingId, provider);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Payment created successfully',
    data: result,
  });
});

const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, paymentIntentId, transactionId } = req.body;
  const result = await PaymentService.confirmPayment(id, { status, paymentIntentId, transactionId });

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment confirmed successfully',
    data: result,
  });
});

const getPaymentHistory = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const customerId = req.user.id;
  const result = await PaymentService.getPaymentHistory(customerId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment history retrieved successfully',
    data: result.payments,
    meta: result.meta,
  });
});

const getPaymentDetails = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const result = await PaymentService.getPaymentDetails(id, customerId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Payment details retrieved successfully',
    data: result,
  });
});

const stripeWebhook = catchAsync(async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const payload = req.body;
  await PaymentService.handleStripeWebhook(payload, sig);
  res.status(StatusCodes.OK).json({ received: true });
});

export const PaymentController = {
  createPayment,
  confirmPayment,
  getPaymentHistory,
  getPaymentDetails,
  stripeWebhook,
};

export default PaymentController;