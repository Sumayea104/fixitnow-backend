import { Prisma, PaymentStatus, PaymentProvider } from '@prisma/client'; 


import prisma from '../../config/prisma';
import config from '../../config/env';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import Stripe from 'stripe';

const stripe = new Stripe(config.stripe.secretKey, {
  apiVersion: '2025-02-24.acacia',
});

export const createPayment = async (customerId: string, bookingId: string, provider: PaymentProvider) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { customer: true, technician: { include: { user: true } }, service: true },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // if (booking.customerId !== customerId) {
  //   throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this booking');
  // }

  // if (booking.status !== 'ACCEPTED') {
  //   throw new AppError(StatusCodes.BAD_REQUEST, 'Booking must be accepted before payment');
  // }

  const existingPayment = await prisma.payment.findUnique({
    where: { bookingId },
  });

  if (existingPayment) {
    throw new AppError(StatusCodes.CONFLICT, 'Payment already exists for this booking');
  }

  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  let paymentIntentId: string | undefined;
  let clientSecret: string | undefined;

  if (provider === PaymentProvider.STRIPE) {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(booking.totalPrice * 100),
      currency: 'usd',
      metadata: { bookingId: booking.id, customerId: customerId, transactionId: transactionId },
      receipt_email: booking.customer.email,
    });

    paymentIntentId = paymentIntent.id;
    clientSecret = paymentIntent.client_secret || undefined;
  }

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
      metadata: { clientSecret },
    },
    include: {
      booking: {
        include: { customer: true, technician: { include: { user: true } }, service: true },
      },
    },
  });

  return { payment, clientSecret, paymentIntentId, publishableKey: config.stripe.publishableKey };
};

export const confirmPayment = async (
  paymentId: string,
  data: { paymentIntentId?: string; transactionId?: string; status: 'COMPLETED' | 'FAILED' }
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
        include: { customer: true, technician: { include: { user: true } }, service: true },
      },
    },
  });

  if (data.status === 'COMPLETED') {
    await prisma.booking.update({
      where: { id: payment.bookingId },
      data: { status: 'PAID' },
    });
  }

  return updatedPayment;
};

export const getPaymentHistory = async (customerId: string, query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const status = query.status as PaymentStatus | undefined;
  const skip = (page - 1) * limit;

  const where: Prisma.PaymentWhereInput = { customerId };
  if (status) where.status = status;

  const payments = await prisma.payment.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      booking: {
        include: {
          customer: { select: { id: true, name: true, email: true } },
          technician: { include: { user: { select: { id: true, name: true, email: true } } } },
          service: { include: { category: true } },
        },
      },
    },
  });

  const total = await prisma.payment.count({ where });

  return { payments, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
};

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
        data: { status: PaymentStatus.COMPLETED, paidAt: new Date() },
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
