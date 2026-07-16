import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import SSLService from './ssl.service';

// ==================== Create SSLCommerz Payment ====================
const createSSLCommerzPayment = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const customerId = req.user.id;
  const { bookingId } = req.body;

  const result = await SSLService.createSSLCommerzPayment(customerId, bookingId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'SSLCommerz payment initiated',
    data: result,
  });
});

// ==================== SSLCommerz Success Callback ====================
const sslSuccess = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.query;

  if (!tran_id) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=Missing transaction ID`);
  }

  try {
    const result = await SSLService.handleSSLCommerzSuccess(tran_id as string);
    
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/success?bookingId=${result.bookingId}`
    );
  } catch (error) {
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/fail?message=${(error as Error).message}`
    );
  }
});

// ==================== SSLCommerz Fail Callback ====================
const sslFail = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.query;

  if (tran_id) {
    await SSLService.handleSSLCommerzFail(tran_id as string);
  }

  return res.redirect(`${process.env.FRONTEND_URL}/payment/fail?message=Payment failed`);
});

// ==================== SSLCommerz Cancel Callback ====================
const sslCancel = catchAsync(async (req: Request, res: Response) => {
  const { tran_id } = req.query;

  if (tran_id) {
    await SSLService.handleSSLCommerzCancel(tran_id as string);
  }

  return res.redirect(`${process.env.FRONTEND_URL}/payment/cancel?message=Payment cancelled`);
});

// ==================== SSLCommerz IPN Handler ====================
const sslIPN = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  await SSLService.handleSSLCommerzIPN(data);
  res.status(StatusCodes.OK).send('OK');
});

export const SSLController = {
  createSSLCommerzPayment,
  sslSuccess,
  sslFail,
  sslCancel,
  sslIPN,
};

export default SSLController;
