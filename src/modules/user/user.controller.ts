import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import UserService from './user.service';

// ==================== Get Profile ====================
const getProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await UserService.getProfile(userId);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile retrieved successfully',
    data: result,
  });
});

// ==================== Update Profile ====================
const updateProfile = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await UserService.updateProfile(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Profile updated successfully',
    data: result,
  });
});

// ==================== Change Password ====================
const changePassword = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await UserService.changePassword(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Password changed successfully',
    data: result,
  });
});

// ==================== Get All Users (Admin) ====================
const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Users retrieved successfully',
    data: result.users,
    meta: result.meta,
  });
});

// ==================== Get User by ID (Admin) ====================
const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await UserService.getUserById(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'User details retrieved successfully',
    data: result,
  });
});

// ==================== Update User Status (Admin) ====================
const updateUserStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  const result = await UserService.updateUserStatus(id, status);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: `User status updated to ${status}`,
    data: result,
  });
});

// ==================== Export ====================
export const UserController = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserStatus,
};

export default UserController;