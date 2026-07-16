import { Prisma } from '@prisma/client';
import prisma from '../../config/prisma';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

// ==================== Create Review ====================
export const createReview = async (customerId: string, data: {
  bookingId: string;
  rating: number;
  comment?: string;
  images?: string[];
  isPublic?: boolean;
}) => {
  // Check if booking exists and is completed
  const booking = await prisma.booking.findUnique({
    where: { id: data.bookingId },
    include: {
      customer: true,
      technician: true,
    },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // Check if booking belongs to customer
  if (booking.customerId !== customerId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You can only review your own bookings');
  }

  // Check if booking is completed
  if (booking.status !== 'COMPLETED') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You can only review completed bookings. Current status: ' + booking.status
    );
  }

  // Check if review already exists
  const existingReview = await prisma.review.findUnique({
    where: { bookingId: data.bookingId },
  });

  if (existingReview) {
    throw new AppError(StatusCodes.CONFLICT, 'You have already reviewed this booking');
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      bookingId: data.bookingId,
      customerId: customerId,
      technicianId: booking.technicianId,
      rating: data.rating,
      comment: data.comment,
      images: data.images || [],
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
      isVerified: true, // Verified because it's from a real booking
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  // Update technician's average rating
  await updateTechnicianRating(booking.technicianId);

  return review;
};

// ==================== Update Technician Rating ====================
export const updateTechnicianRating = async (technicianId: string) => {
  const reviews = await prisma.review.findMany({
    where: { technicianId },
    select: { rating: true },
  });

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? parseFloat((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
    : 0;

  await prisma.technicianProfile.update({
    where: { id: technicianId },
    data: {
      averageRating,
      totalReviews,
    },
  });

  return { averageRating, totalReviews };
};

// ==================== Get Reviews for Technician ====================
export const getTechnicianReviews = async (technicianId: string, query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const minRating = query.minRating ? parseInt(query.minRating) : undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {
    technicianId,
    isPublic: true,
  };

  if (minRating) {
    where.rating = { gte: minRating };
  }

  const reviews = await prisma.review.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  const total = await prisma.review.count({ where });

  // Calculate rating distribution
  const ratingDistribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { technicianId, isPublic: true },
    _count: true,
  });

  const distribution = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0,
  };
  ratingDistribution.forEach((item) => {
    distribution[item.rating as keyof typeof distribution] = item._count;
  });

  // Get technician info
  const technician = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
    },
  });

  return {
    reviews,
    technician: {
      id: technician?.id,
      name: technician?.user.name,
      averageRating: technician?.averageRating || 0,
      totalReviews: technician?.totalReviews || 0,
      ratingDistribution: distribution,
    },
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== Get All Reviews (Public) ====================
export const getAllReviews = async (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const technicianId = query.technicianId as string | undefined;
  const rating = query.rating ? parseInt(query.rating) : undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.ReviewWhereInput = {
    isPublic: true,
  };

  if (technicianId) {
    where.technicianId = technicianId;
  }

  if (rating) {
    where.rating = rating;
  }

  const reviews = await prisma.review.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          profileImage: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      },
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  const total = await prisma.review.count({ where });

  return {
    reviews,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== Get Review Details ====================
export const getReviewDetails = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },
      booking: {
        include: {
          service: true,
        },
      },
    },
  });

  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  return review;
};

// ==================== Update Review ====================
export const updateReview = async (
  reviewId: string,
  customerId: string,
  data: {
    rating?: number;
    comment?: string;
    images?: string[];
    isPublic?: boolean;
  }
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  // Check if review belongs to customer
  if (review.customerId !== customerId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You can only update your own reviews');
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      rating: data.rating,
      comment: data.comment,
      images: data.images,
      isPublic: data.isPublic,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  // Update technician's average rating if rating changed
  if (data.rating !== undefined) {
    await updateTechnicianRating(review.technicianId);
  }

  return updatedReview;
};

// ==================== Reply to Review (Technician) ====================
export const replyToReview = async (
  reviewId: string,
  technicianId: string,
  reply: string
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  // Check if review belongs to this technician
  if (review.technicianId !== technicianId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You can only reply to reviews for your services');
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      reply: reply,
      replyAt: new Date(),
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          profileImage: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profileImage: true,
            },
          },
        },
      },
    },
  });

  return updatedReview;
};

// ==================== Delete Review ====================
export const deleteReview = async (reviewId: string, userId: string, userRole: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  // Check permission: customer can delete own review, admin can delete any review
  if (userRole === 'CUSTOMER' && review.customerId !== userId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You can only delete your own reviews');
  }

  if (userRole === 'TECHNICIAN') {
    throw new AppError(StatusCodes.FORBIDDEN, 'Technicians cannot delete reviews');
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update technician's average rating
  await updateTechnicianRating(review.technicianId);

  return { id: reviewId, message: 'Review deleted successfully' };
};

// ==================== Mark Review as Helpful ====================
export const markReviewHelpful = async (reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Review not found');
  }

  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      helpfulCount: {
        increment: 1,
      },
    },
  });

  return updatedReview;
};

export const ReviewService = {
  createReview,
  getTechnicianReviews,
  getAllReviews,
  getReviewDetails,
  updateReview,
  replyToReview,
  deleteReview,
  markReviewHelpful,
  updateTechnicianRating,
};

export default ReviewService;
