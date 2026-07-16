import { PaymentStatus, PaymentProvider } from '@prisma/client';
import prisma from '../../config/prisma';
import config from '../../config/env';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

// SSLCommerz - No types available, use require
const SSLCommerz = require('sslcommerz-lts');

const store_id = config.sslCommerz.storeId;
const store_passwd = config.sslCommerz.storePassword;
const is_live = config.nodeEnv === 'production';

const sslcz = new SSLCommerz(store_id, store_passwd, is_live);

// ==================== Create SSLCommerz Payment ====================
export const createSSLCommerzPayment = async (customerId: string, bookingId: string) => {
  // Check if booking exists and is valid
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      technician: {
        include: {
          user: true,
        },
      },
      service: true,
    },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  if (booking.customerId !== customerId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this booking');
  }

  if (booking.status !== 'ACCEPTED') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Booking must be accepted before payment. Current status: ' + booking.status
    );
  }

  // Check if payment already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (existingPayment) {
    throw new AppError(StatusCodes.CONFLICT, 'Payment already exists for this booking');
  }

  // Generate transaction ID
  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      customerId: customerId,
      transactionId: transactionId,
      amount: booking.totalPrice,
      currency: 'BDT',
      provider: PaymentProvider.SSLCOMMERZ,
      status: PaymentStatus.PENDING,
    },
  });

  // Prepare SSLCommerz data
  const sslCallbackBaseUrl = config.sslCommerz.baseUrl.replace(/\/$/, '');

  const data = {
    total_amount: booking.totalPrice,
    currency: 'BDT',
    tran_id: transactionId,
    success_url: `${sslCallbackBaseUrl}/success?tran_id=${transactionId}`,
    fail_url: `${sslCallbackBaseUrl}/fail?tran_id=${transactionId}`,
    cancel_url: `${sslCallbackBaseUrl}/cancel?tran_id=${transactionId}`,
    ipn_url: `${sslCallbackBaseUrl}/ipn`,
    shipping_method: 'No',
    product_name: booking.service.title,
    product_category: 'Service',
    product_profile: 'service',
    cus_name: booking.customer.name,
    cus_email: booking.customer.email,
    cus_add1: booking.customer.address || 'Dhaka',
    cus_city: 'Dhaka',
    cus_state: 'Dhaka',
    cus_postcode: '1000',
    cus_country: 'Bangladesh',
    cus_phone: booking.customer.phone || '01700000000',
    multi_card_name: 'mastercard,visacard,amexcard',
    value_a: booking.id,
    value_b: customerId,
    value_c: payment.id,
  };

  // Initiate SSLCommerz payment
  try {
    const sslczResponse = await sslcz.init(data);

    if (sslczResponse?.GatewayPageURL) {
      return {
        payment,
        redirectUrl: sslczResponse.GatewayPageURL,
        transactionId,
      };
    } else {
      // If SSLCommerz fails, update payment status to failed
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      });

      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Failed to initiate SSLCommerz payment. Please try again.'
      );
    }
  } catch (error) {
    await prisma.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    });
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'SSLCommerz payment initiation failed. Please try again.'
    );
  }
};

// ==================== SSLCommerz Success Handler ====================
export const handleSSLCommerzSuccess = async (tran_id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: tran_id },
    include: {
      booking: true,
    },
  });

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  // Validate payment with SSLCommerz
  try {
    const validation = await sslcz.validate(tran_id);

    if (validation?.status === 'VALID' || validation?.status === 'VALIDATED') {
      // Update payment status
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
          paymentMethod: validation?.card_type || 'Unknown',
        },
      });

      // Update booking status
      await prisma.booking.update({
        where: { id: payment.bookingId },
        data: { status: 'PAID' },
      });

      return {
        success: true,
        message: 'Payment completed successfully',
        bookingId: payment.bookingId,
      };
    }

    // If validation fails
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: 'SSLCommerz validation failed',
      },
    });

    throw new AppError(StatusCodes.BAD_REQUEST, 'Payment validation failed');
  } catch (error) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Payment validation failed');
  }
};

// ==================== SSLCommerz Fail Handler ====================
export const handleSSLCommerzFail = async (tran_id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: tran_id },
  });

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.FAILED,
      failureReason: 'Payment failed at SSLCommerz',
    },
  });

  return {
    success: false,
    message: 'Payment failed',
  };
};

// ==================== SSLCommerz Cancel Handler ====================
export const handleSSLCommerzCancel = async (tran_id: string) => {
  const payment = await prisma.payment.findUnique({
    where: { transactionId: tran_id },
  });

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      status: PaymentStatus.FAILED,
      failureReason: 'Payment cancelled by user',
    },
  });

  return {
    success: false,
    message: 'Payment cancelled',
  };
};

// ==================== SSLCommerz IPN Handler ====================
export const handleSSLCommerzIPN = async (data: any) => {
  const tran_id = data.tran_id;
  const status = data.status;

  const payment = await prisma.payment.findUnique({
    where: { transactionId: tran_id },
    include: {
      booking: true,
    },
  });

  if (!payment) {
    console.log(`❌ IPN: Payment not found for transaction: ${tran_id}`);
    return { received: false };
  }

  if (status === 'VALID') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.COMPLETED,
        paidAt: new Date(),
        paymentMethod: data.card_type || 'Unknown',
      },
    });

    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAID' },
    });

    console.log(`✅ IPN: Payment completed for booking: ${payment.bookingId}`);
  } else if (status === 'FAILED') {
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.FAILED,
        failureReason: 'IPN status: FAILED',
      },
    });
    console.log(`❌ IPN: Payment failed for booking: ${payment.bookingId}`);
  }

  return { received: true };
};

export const SSLService = {
  createSSLCommerzPayment,
  handleSSLCommerzSuccess,
  handleSSLCommerzFail,
  handleSSLCommerzCancel,
  handleSSLCommerzIPN,
};

export default SSLService;
