import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import BookingService from './booking.service';

// ==================== Create Booking ====================
const createBooking = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await BookingService.createBooking(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Booking created successfully',
    data: result,
  });
});

// ==================== Get User's Bookings ====================
const getUserBookings = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await BookingService.getUserBookings(userId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result.bookings,
    meta: result.meta,
  });
});

// ==================== Get Booking Details ====================
const getBookingDetails = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await BookingService.getBookingDetails(id, userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking details retrieved successfully',
    data: result,
  });
});

// ==================== Cancel Booking ====================
const cancelBooking = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { reason } = req.body;
  const result = await BookingService.cancelBooking(id, userId, reason);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking cancelled successfully',
    data: result,
  });
});

// ==================== Update Booking Status (Technician) ====================
const updateBookingStatus = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { status } = req.body;
  const result = await BookingService.updateBookingStatusByTechnician(id, userId, status);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Booking status updated to ${status}`,
    data: result,
  });
});

// ==================== Get Booking History (Admin) ====================
const getBookingHistory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await BookingService.getBookingStatusHistory(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Booking history retrieved successfully',
    data: result,
  });
});

// ==================== Export ====================
export const BookingController = {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  updateBookingStatus,
  getBookingHistory,
};