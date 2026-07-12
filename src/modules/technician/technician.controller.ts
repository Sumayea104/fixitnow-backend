import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import TechnicianService from './technician.service';

// ==================== Get Technician Profile ====================
const getTechnicianProfile = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await TechnicianService.getTechnicianProfile(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Technician profile retrieved successfully',
    data: result,
  });
});

// ==================== Get All Technicians (Public) ====================
const getAllTechnicians = catchAsync(async (req: Request, res: Response) => {
  const result = await TechnicianService.getAllTechnicians(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Technicians retrieved successfully',
    data: result.technicians,
    meta: result.meta,
  });
});

// ==================== Update Technician Profile ====================
const updateTechnicianProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await TechnicianService.updateTechnicianProfile(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Technician profile updated successfully',
    data: result,
  });
});

// ==================== Update Availability Slots ====================
const updateAvailabilitySlots = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const { availabilitySlots } = req.body;
  const result = await TechnicianService.updateAvailabilitySlots(userId, availabilitySlots || []);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Availability slots updated successfully',
    data: result,
  });
});

// ==================== Get Technician's Bookings ====================
const getTechnicianBookings = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await TechnicianService.getTechnicianBookings(userId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result.bookings,
    meta: result.meta,
  });
});

// ==================== Update Booking Status ====================
const updateBookingStatus = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { status } = req.body;
  const result = await TechnicianService.updateBookingStatus(userId, id, status);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Booking status updated to ${status}`,
    data: result,
  });
});

// ==================== Get Technician Stats ====================
const getTechnicianStats = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await TechnicianService.getTechnicianStats(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Technician statistics retrieved successfully',
    data: result,
  });
});

// ==================== Export ====================
export const TechnicianController = {
  getTechnicianProfile,
  getAllTechnicians,
  updateTechnicianProfile,
  updateAvailabilitySlots,
  getTechnicianBookings,
  updateBookingStatus,
  getTechnicianStats,
};

export default TechnicianController;