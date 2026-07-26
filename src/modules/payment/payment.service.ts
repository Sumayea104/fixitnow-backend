import { Prisma, PaymentStatus, PaymentProvider } from '@prisma/client';
import prisma from '../../config/prisma';
import config from '../../config/env';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-02-24.acacia',
});

// ==================== Create Payment ====================
export const createPayment = async (
  customerId: string,
  bookingId: string,
  provider: PaymentProvider
) => {
  // Check if booking exists
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: true,
      technician: { include: { user: true } },
      service: true,
    },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // Check if user owns this booking
  if (booking.customerId !== customerId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this booking');
  }

  // Check if booking is accepted
  if (booking.status !== 'ACCEPTED') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Booking must be accepted before payment');
  }

  // Check if payment already exists
  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (existingPayment) {
    throw new AppError(StatusCodes.CONFLICT, 'Payment already exists for this booking');
  }

  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  let paymentIntentId: string | undefined;
  let clientSecret: string | undefined;

  // Stripe Payment
  if (provider === PaymentProvider.STRIPE) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: 'usd',
      metadata: {
        bookingId: booking.id,
        customerId: customerId,
        transactionId: transactionId,
      },
      receipt_email: booking.customer.email,
    });

    paymentIntentId = paymentIntent.id;
    clientSecret = paymentIntent.client_secret || undefined;
  }

  // SSLCommerz Payment (handled separately)
  if (provider === PaymentProvider.SSLCOMMERZ) {
    // SSLCommerz will be handled in a separate flow
    // We just create a pending payment record
    paymentIntentId = undefined;
    clientSecret = undefined;
  }

  // Create payment record
  const payment = await prisma.payment.create({
    data: {
      bookingId: booking.id,
      customerId: customerId,
      transactionId: transactionId,
      amount: booking.totalPrice,
      currency: 'USD',
      provider: provider,
      status: PaymentStatus.PENDING,
      paymentIntentId: paymentIntentId,
      metadata: clientSecret ? { clientSecret } : {},
    },
    include: {
      booking: {
        include: {
          customer: true,
          technician: { include: { user: true } },
          service: true,
        },
      },
    },
  });

  return {
    payment,
    clientSecret,
    paymentIntentId,
    publishableKey: config.stripe.publishableKey,
  };
};

// ==================== Confirm Payment ====================
export const confirmPayment = async (
  paymentId: string,
  data: {
    paymentIntentId?: string;
    transactionId?: string;
    status: 'COMPLETED' | 'FAILED';
  }
) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  });

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status: data.status === 'COMPLETED' ? PaymentStatus.COMPLETED : PaymentStatus.FAILED,
      paidAt: data.status === 'COMPLETED' ? new Date() : null,
      paymentIntentId: data.paymentIntentId || payment.paymentIntentId,
    },
    include: {
      booking: {
        include: {
          customer: true,
          technician: { include: { user: true } },
          service: true,
        },
      },
    },
  });

  // If payment is completed, update booking status to PAID
  if (data.status === 'COMPLETED') {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAID' },
    });
  }

  return updatedPayment;
};

// ==================== Get Payment History ====================
export const getPaymentHistory = async (customerId: string, query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const status = query.status as PaymentStatus | undefined;
  const provider = query.provider as PaymentProvider | undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = {
    customerId,
  };

  if (status) {
    where.status = status;
  }

  if (provider) {
    where.provider = provider;
  }

  const payments = await prisma.payment.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      booking: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          technician: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          service: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  const total = await prisma.payment.count({ where });

  return {
    payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== Get Payment Details ====================
export const getPaymentDetails = async (paymentId: string, customerId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        include: {
          customer: true,
          technician: { include: { user: true } },
          service: { include: { category: true } },
        },
      },
    },
  });

  if (!payment) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Payment not found');
  }

  if (payment.customerId !== customerId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this payment');
  }

  return payment;
};

// ==================== Handle Stripe Webhook ====================
export const handleStripeWebhook = async (payload: any, sig: string) => {
  const endpointSecret = config.stripe.webhookSecret;
  let event: Stripe.Event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } else {
      event = JSON.parse(payload);
      console.log('⚠️ Webhook signature verification skipped (development mode)');
    }
  } catch (err: any) {
    console.error(`❌ Webhook error: ${err.message}`);
    throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid webhook');
  }

  console.log(`✅ Webhook received: ${event.type}`);

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const bookingId = paymentIntent.metadata.bookingId;

    const payment = await prisma.payment.findFirst({
      where: { paymentIntentId: paymentIntent.id },
    });

    if (payment) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.COMPLETED,
          paidAt: new Date(),
        },
      });

      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'PAID' },
      });

      console.log(`✅ Payment completed for booking: ${bookingId}`);
    }
  }

  return { received: true };
};

export const PaymentService = {
  createPayment,
  confirmPayment,
  getPaymentHistory,
  getPaymentDetails,
  handleStripeWebhook,
};

export default PaymentService;