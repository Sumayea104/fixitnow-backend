import { Prisma, UserRole, BookingStatus } from '../../generated/prisma';
import prisma from '../../config/prisma';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

// ==================== Get Technician Profile ====================
export const getTechnicianProfile = async (technicianId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          address: true,
        },
      },
      services: {
        where: { isActive: true },
        include: {
          category: true,
        },
      },
      availabilitySlots: {
        where: {
          isBooked: false,
          OR: [
            { isRecurring: true },
            { specificDate: { gte: new Date() } },
          ],
        },
        orderBy: {
          dayOfWeek: 'asc',
        },
      },
      reviewsReceived: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              profileImage: true,
            },
          },
        },
      },
      _count: {
        select: {
          services: true,
          bookings: true,
          reviewsReceived: true,
        },
      },
    },
  });

  if (!technician) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Technician not found');
  }

  return technician;
};

// ==================== Update Technician Profile ====================
export const updateTechnicianProfile = async (userId: string, data: {
  bio?: string;
  experience?: number;
  hourlyRate?: number;
  location?: string;
  skills?: string[];
  isAvailable?: boolean;
}) => {
  // Find technician profile
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technician) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Technician profile not found');
  }

  // Update profile
  const updatedTechnician = await prisma.technicianProfile.update({
    where: { userId },
    data: {
      bio: data.bio,
      experience: data.experience,
      hourlyRate: data.hourlyRate,
      location: data.location,
      skills: data.skills,
      isAvailable: data.isAvailable,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          address: true,
        },
      },
    },
  });

  return updatedTechnician;
};

// ==================== Get All Technicians (Public) ====================
export const getAllTechnicians = async (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const search = query.search as string | undefined;
  const location = query.location as string | undefined;
  const minRating = query.minRating ? parseFloat(query.minRating) : undefined;
  const isAvailable = query.isAvailable as boolean | undefined;
  const service = query.service as string | undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.TechnicianProfileWhereInput = {};

  // Search filter
  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: 'insensitive' } } },
      { skills: { hasSome: [search] } },
      { bio: { contains: search, mode: 'insensitive' } },
    ];
  }

  // Location filter
  if (location) {
    where.location = { contains: location, mode: 'insensitive' };
  }

  // Rating filter
  if (minRating) {
    where.averageRating = { gte: minRating };
  }

  // Availability filter
  if (isAvailable !== undefined) {
    where.isAvailable = isAvailable;
  }

  // Service filter - check if technician offers a specific service
  if (service) {
    where.services = {
      some: {
        OR: [
          { title: { contains: service, mode: 'insensitive' } },
          { category: { name: { contains: service, mode: 'insensitive' } } },
        ],
      },
    };
  }

  const technicians = await prisma.technicianProfile.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
          address: true,
        },
      },
      services: {
        where: { isActive: true },
        include: {
          category: true,
        },
        take: 3,
      },
      _count: {
        select: {
          services: true,
          bookings: true,
          reviewsReceived: true,
        },
      },
    },
  });

  const total = await prisma.technicianProfile.count({ where });

  return {
    technicians,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ==================== Update Availability Slots ====================
export const updateAvailabilitySlots = async (userId: string, slots: {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  specificDate?: string;
  maxBookings?: number;
}[]) => {
  // Find technician profile
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technician) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Technician profile not found');
  }

  // Delete all existing availability slots
  await prisma.availabilitySlot.deleteMany({
    where: { technicianId: technician.id },
  });

  // Create new availability slots
  if (slots && slots.length > 0) {
    const createdSlots = await prisma.availabilitySlot.createMany({
      data: slots.map((slot) => ({
        technicianId: technician.id,
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isRecurring: slot.isRecurring,
        specificDate: slot.specificDate ? new Date(slot.specificDate) : null,
        maxBookings: slot.maxBookings || 1,
        isBooked: false,
      })),
    });

    return createdSlots;
  }

  return { count: 0 };
};

// ==================== Get Technician's Bookings ====================
export const getTechnicianBookings = async (userId: string, query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const status = query.status as BookingStatus | undefined;
  const sortBy = query.sortBy || 'scheduledDate';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';

  const skip = (page - 1) * limit;

  // Find technician profile
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technician) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Technician profile not found');
  }

  const where: Prisma.BookingWhereInput = {
    technicianId: technician.id,
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
      customer: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          profileImage: true,
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

// ==================== Update Booking Status (Technician) ====================
export const updateBookingStatus = async (
  userId: string,
  bookingId: string,
  status: 'ACCEPTED' | 'DECLINED' | 'IN_PROGRESS' | 'COMPLETED'
) => {
  // Find technician profile
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technician) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Technician profile not found');
  }

  // Find booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      service: true,
    },
  });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  // Check if booking belongs to this technician
  if (booking.technicianId !== technician.id) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have permission to update this booking');
  }

  // Validate status transition
  const validTransitions: Record<string, string[]> = {
    REQUESTED: ['ACCEPTED', 'DECLINED'],
    ACCEPTED: ['IN_PROGRESS', 'CANCELLED'],
    PAID: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED'],
  };

  if (!validTransitions[booking.status]?.includes(status)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      `Cannot transition from ${booking.status} to ${status}`
    );
  }

  // Update booking status
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
          profileImage: true,
        },
      },
      service: {
        include: {
          category: true,
        },
      },
      payment: true,
    },
  });

  // If booking is COMPLETED, update technician stats
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

// ==================== Get Technician Stats ====================
export const getTechnicianStats = async (userId: string) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { userId },
  });

  if (!technician) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Technician profile not found');
  }

  const [
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenue,
    totalServices,
  ] = await Promise.all([
    prisma.booking.count({ where: { technicianId: technician.id } }),
    prisma.booking.count({
      where: {
        technicianId: technician.id,
        status: 'REQUESTED',
      },
    }),
    prisma.booking.count({
      where: {
        technicianId: technician.id,
        status: 'COMPLETED',
      },
    }),
    prisma.payment.aggregate({
      where: {
        booking: { technicianId: technician.id },
        status: 'COMPLETED',
      },
      _sum: { amount: true },
    }),
    prisma.service.count({
      where: {
        technicianId: technician.id,
        isActive: true,
      },
    }),
  ]);

  return {
    technician: {
      id: technician.id,
      bio: technician.bio,
      experience: technician.experience,
      hourlyRate: technician.hourlyRate,
      averageRating: technician.averageRating,
      totalReviews: technician.totalReviews,
      isAvailable: technician.isAvailable,
      isVerified: technician.isVerified,
      completedJobs: technician.completedJobs,
      location: technician.location,
      skills: technician.skills,
    },
    stats: {
      totalBookings,
      pendingBookings,
      completedBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      totalServices,
    },
  };
};

export const TechnicianService = {
  getTechnicianProfile,
  updateTechnicianProfile,
  getAllTechnicians,
  updateAvailabilitySlots,
  getTechnicianBookings,
  updateBookingStatus,
  getTechnicianStats,
};

export default TechnicianService;