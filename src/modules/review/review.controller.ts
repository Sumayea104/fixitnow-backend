import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import ReviewService from './review.service';

// ==================== Create Review ====================
const createReview = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const result = await ReviewService.createReview(userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.CREATED,
    success: true,
    message: 'Review created successfully',
    data: result,
  });
});

// ==================== Get All Reviews ====================
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

// ==================== Get Reviews by Technician ====================
const getTechnicianReviews = catchAsync(async (req: Request, res: Response) => {
  const { technicianId } = req.params;
  const result = await ReviewService.getTechnicianReviews(technicianId, req.query);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Technician reviews retrieved successfully',
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
  const userId = req.user.id;
  const { id } = req.params;
  const result = await ReviewService.updateReview(id, userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review updated successfully',
    data: result,
  });
});

// ==================== Delete Review ====================
const deleteReview = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const result = await ReviewService.deleteReview(id, userId, req.body);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Review deleted successfully',
    data: result,
  });
});

// ==================== Reply to Review (Technician) ====================
const replyToReview = catchAsync(async (req: Request & { user?: any }, res: Response) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { reply } = req.body;
  const result = await ReviewService.replyToReview(id, userId, reply);

  sendResponse(res, {
    statusCode: StatusCodes.OK,
    success: true,
    message: 'Reply added successfully',
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

// ==================== Export ====================
export const ReviewController = {
  createReview,
  getAllReviews,           // ✅ GET /api/reviews
  getTechnicianReviews,    // ✅ GET /api/reviews/technician/:technicianId
  getReviewDetails,        // ✅ GET /api/reviews/:id
  updateReview,            // ✅ PATCH /api/reviews/:id
  deleteReview,            // ✅ DELETE /api/reviews/:id
  replyToReview,           // ✅ POST /api/reviews/:id/reply
  markReviewHelpful,       // ✅ POST /api/reviews/:id/helpful
};

export default ReviewController;