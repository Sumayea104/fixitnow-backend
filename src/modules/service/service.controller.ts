import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ServiceService from './service.service';
import prisma from '../../config/prisma';  // ← Add this import

// ==================== Create Service ====================
const createService = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  // Get technician profile ID from user
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!technician) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Technician profile not found. Please complete your profile first.',
    });
  }

  const result = await ServiceService.createService(technician.id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Service created successfully',
    data: result,
  });
});

// ==================== Get All Services (Public) ====================
const getAllServices = catchAsync(async (req: Request, res: Response) => {
  const result = await ServiceService.getAllServices(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Services retrieved successfully',
    data: result.services,
    meta: result.meta,
  });
});

// ==================== Get Service Details ====================
const getServiceDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ServiceService.getServiceDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Service details retrieved successfully',
    data: result,
  });
});

// ==================== Update Service ====================
const updateService = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params;
  
  // Get technician profile
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!technician) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Technician profile not found',
    });
  }

  const result = await ServiceService.updateService(technician.id, id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Service updated successfully',
    data: result,
  });
});

// ==================== Delete Service ====================
const deleteService = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params;
  
  // Get technician profile
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!technician) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Technician profile not found',
    });
  }

  const result = await ServiceService.deleteService(technician.id, id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Service deleted successfully',
    data: result,
  });
});

// ==================== Get Technician Services ====================
const getTechnicianServices = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!technician) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Technician profile not found',
    });
  }

  const result = await ServiceService.getTechnicianServices(technician.id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Services retrieved successfully',
    data: result,
  });
});

// ==================== Export ====================
export const ServiceController = {
  createService,
  getAllServices,
  getServiceDetails,
  updateService,
  deleteService,
  getTechnicianServices,
};

export default ServiceController;
