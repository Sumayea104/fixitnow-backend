import { Prisma, BookingStatus } from '../../generated/prisma';
import prisma from '../../config/prisma';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';
import { bookingStatusTransitions } from './booking.constant';
import { ICreateBooking } from './booking.interface';

// Helper function to generate booking number
const generateBookingNumber = (): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}-${random}`;
};

// ==================== Create Booking ====================
export const createBooking = async (customerId: string, data: ICreateBooking) => {
  // Check if service exists and is active
  const service = await prisma.service.findUnique({
    where: { id: data.serviceId, isActive: true },
    include: {
      technician: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!service) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Service not found or inactive');
  }

  // Check if technician is available
  if (!service.technician.isAvailable) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Technician is currently unavailable');
  }

  // Check if customer is booking their own service
  if (service.technician.userId === customerId) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You cannot book your own service');
  }

  // Check for duplicate booking at same time
  const existingBooking = await prisma.booking.findFirst({
    where: {
      technicianId: service.technician.id,
      scheduledDate: new Date(data.scheduledDate),
      scheduledTime: data.scheduledTime,
      status: {
        in: ['REQUESTED', 'ACCEPTED', 'PAID', 'IN_PROGRESS'],
      },
    },
  });

  if (existingBooking) {
    throw new AppError(
      StatusCodes.CONFLICT,
      'This time slot is already booked. Please choose another time.'
    );
  }

  // Calculate total price (with discount if available)
  const totalPrice = service.discountedPrice || service.price;

  // Create booking
  const booking = await prisma.booking.create({
    data: {
      bookingNumber: generateBookingNumber(),
      customerId,
      technicianId: service.technician.id,
      serviceId: data.serviceId,
      scheduledDate: new Date(data.scheduledDate),
      scheduledTime: data.scheduledTime,
      durationMinutes: data.durationMinutes || service.durationMinutes || 60,
      totalPrice,
      status: BookingStatus.REQUESTED,
      notes: data.notes,
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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
  });

  return booking;
};

// ==================== Get User's Bookings ====================
export const getUserBookings = async (userId: string, query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const status = query.status as BookingStatus | undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.BookingWhereInput = {
    customerId: userId,
  };

  if (status) {
    where.status = status;
  }

  const bookings = await prisma.booking.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
              profileImage: true,
            },
          },
        },
      },
      service: {
        include: {
          category: true,
        },
      },
      payment: true,
      review: true,
    },
  });

  const total = await prisma.booking.count({ where });

  return {
    bookings,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== Get Booking Details ====================
export const getBookingDetails = async (bookingId: string, userId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
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
              phone: true,
              profileImage: true,
            },
          },
        },
      },
      service: {
        include: {
          category: true,
        },
      },
      payment: true,
      review: true,
    },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // Check if user has access to this booking
  if (booking.customerId !== userId && booking.technician.userId !== userId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have access to this booking');
  }

  return booking;
};

// ==================== Cancel Booking (Customer) ====================
export const cancelBooking = async (bookingId: string, userId: string, reason?: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // Check if user is the customer
  if (booking.customerId !== userId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You can only cancel your own bookings');
  }

  // Check if booking can be cancelled (only before IN_PROGRESS)
  if (booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Cannot cancel booking that is in progress or completed'
    );
  }

  if (booking.status === 'CANCELLED') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Booking is already cancelled');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: BookingStatus.CANCELLED,
      cancellationReason: reason || 'Cancelled by customer',
      cancelledBy: userId,
      cancelledAt: new Date(),
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      service: true,
    },
  });

  return updatedBooking;
};

// ==================== Update Booking Status (Technician) ====================
export const updateBookingStatusByTechnician = async (
  bookingId: string,
  userId: string,
  status: 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED'
) => {
  // Find technician
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technician) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Technician profile not found');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // Check if booking belongs to this technician
  if (booking.technicianId !== technician.id) {
    throw new AppError(StatusCodes.FORBIDDEN, 'This booking does not belong to you');
  }

  // Validate status transition
  if (!bookingStatusTransitions[booking.status]?.includes(status)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Cannot transition from ${booking.status} to ${status}`
    );
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: status as BookingStatus },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
      },
      technician: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
        },
      },
      service: true,
    },
  });

  // If booking is completed, update technician stats
  if (status === 'COMPLETED') {
    await prisma.technicianProfile.update({
      where: { id: technician.id },
      data: {
        completedJobs: { increment: 1 },
      },
    });
  }

  return updatedBooking;
};

// ==================== Get Booking Status History (Admin) ====================
export const getBookingStatusHistory = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
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
      service: true,
      payment: true,
      review: true,
    },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  return booking;
};

export const BookingService = {
  createBooking,
  getUserBookings,
  getBookingDetails,
  cancelBooking,
  updateBookingStatusByTechnician,
  getBookingStatusHistory,
};

export default BookingService;