import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import AdminService from './admin.service'; 
import { UserStatus, BookingStatus } from '@prisma/client';


// ==================== Helper to parse query ====================
const parseQuery = (query: any) => {
  return {
    page: Math.max(1, parseInt(query.page) || 1),
    limit: Math.min(parseInt(query.limit) || 10, 100),
    sortBy: (query.sortBy as string) || 'createdAt',
    sortOrder: (query.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    search: query.search as string | undefined,
    status: query.status as UserStatus | undefined,
    role: query.role as string | undefined,
  };
};

// ==================== User Management ====================

const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const parsedQuery = parseQuery(req.query);
  const result = await AdminService.getAllUsers(parsedQuery);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result.users,
    meta: result.meta,
  });
});

const getUserDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.getUserDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User details retrieved successfully',
    data: result,
  });
});

const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await AdminService.updateUserStatus(id, status);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `User status updated to ${status}`,
    data: result,
  });
});

// ==================== Booking Management ====================

const getAllBookings = catchAsync(async (req: Request, res: Response) => {
  const parsedQuery = {
    page: Math.max(1, parseInt(req.query.page as string) || 1),
    limit: Math.min(parseInt(req.query.limit as string) || 10, 100),
    sortBy: (req.query.sortBy as string) || 'createdAt',
    sortOrder: (req.query.sortOrder === 'asc' ? 'asc' : 'desc') as 'asc' | 'desc',
    status: req.query.status as BookingStatus | undefined,
    search: req.query.search as string | undefined,
    startDate: req.query.startDate as string | undefined,
    endDate: req.query.endDate as string | undefined,
  };
  
  const result = await AdminService.getAllBookings(parsedQuery);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Bookings retrieved successfully',
    data: result.bookings,
    meta: result.meta,
  });
});

const updateBookingStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await AdminService.updateBookingStatus(id, status);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Booking status updated to ${status}`,
    data: result,
  });
});

// ==================== Dashboard ====================

const getDashboardStats = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getDashboardStats();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Dashboard statistics retrieved successfully',
    data: result,
  });
});

// ==================== Technician Management ====================

const verifyTechnician = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { isVerified } = req.body;
  const result = await AdminService.verifyTechnician(id, isVerified);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `Technician ${isVerified ? 'verified' : 'unverified'} successfully`,
    data: result,
  });
});

// ==================== Category Management ====================

const createCategory = catchAsync(async (req: Request, res: Response) => {
  const result = await AdminService.createCategory(req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.updateCategory(id, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await AdminService.deleteCategory(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Category deleted successfully',
    data: result,
  });
});

const getAllCategories = catchAsync(async (_req: Request, res: Response) => {
  const result = await AdminService.getAllCategories();

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Categories retrieved successfully',
    data: result,
  });
});

// ==================== Export ====================

export const AdminController = {
  // User Management
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  
  // Booking Management
  getAllBookings,
  updateBookingStatus,
  
  // Dashboard
  getDashboardStats,
  
  // Technician Management
  verifyTechnician,
  
  // Category Management
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
};

export default AdminController;
