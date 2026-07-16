import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ReviewService from './review.service';
import prisma from '../../config/prisma';

// ==================== Create Review ====================
const createReview = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const customerId = req.user.id;
  const result = await ReviewService.createReview(customerId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

// ==================== Get Technician Reviews ====================
const getTechnicianReviews = catchAsync(async (req: Request, res: Response) => {
  const { technicianId } = req.params;
  const result = await ReviewService.getTechnicianReviews(technicianId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result.reviews,
    meta: result.meta,
  });
});

// ==================== Get All Reviews (Public) ====================
const getAllReviews = catchAsync(async (req: Request, res: Response) => {
  const result = await ReviewService.getAllReviews(req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reviews retrieved successfully',
    data: result.reviews,
    meta: result.meta,
  });
});

// ==================== Get Review Details ====================
const getReviewDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.getReviewDetails(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review details retrieved successfully',
    data: result,
  });
});

// ==================== Update Review ====================
const updateReview = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params;
  const customerId = req.user.id;
  const result = await ReviewService.updateReview(id, customerId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

// ==================== Reply to Review ====================
const replyToReview = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params;
  const { reply } = req.body;

  // Get technician profile
  const technician = await prisma?.technicianProfile.findUnique({
    where: { userId: req.user.id },
  });

  if (!technician) {
    return sendResponse(res, {
      statusCode: StatusCodes.NOT_FOUND,
      success: false,
      message: 'Technician profile not found',
    });
  }

  const result = await ReviewService.replyToReview(id, technician.id, reply);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reply added successfully',
    data: result,
  });
});

// ==================== Delete Review ====================
const deleteReview = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;
  const result = await ReviewService.deleteReview(id, userId, userRole);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

// ==================== Mark Review Helpful ====================
const markReviewHelpful = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const result = await ReviewService.markReviewHelpful(id);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review marked as helpful',
    data: result,
  });
});

export const ReviewController = {
  createReview,
  getTechnicianReviews,
  getAllReviews,
  getReviewDetails,
  updateReview,
  replyToReview,
  deleteReview,
  markReviewHelpful,
};

export default ReviewController;
