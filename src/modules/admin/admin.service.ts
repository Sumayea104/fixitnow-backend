import { Prisma, UserStatus, BookingStatus } from '@prisma/client';
import prisma from '../../config/prisma';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

// ==================== User Management ====================

export const getAllUsers = async (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const search = query.search as string | undefined;
  const status = query.status as UserStatus | undefined;
  const role = query.role as string | undefined;
  
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (status) {
    where.status = status;
  }

  if (role) {
    where.role = role as any;
  }

  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      status: true,
      isEmailVerified: true,
      createdAt: true,
      updatedAt: true,
      technicianProfile: {
        select: {
          id: true,
          isAvailable: true,
          isVerified: true,
          averageRating: true,
          totalReviews: true,
          completedJobs: true,
          experience: true,
          hourlyRate: true,
          location: true,
        },
      },
      _count: {
        select: {
          bookingsAsCustomer: true,
          reviews: true,
        },
      },
    },
  });

  const total = await prisma.user.count({ where });

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (user.role === 'ADMIN') {
    throw new AppError(StatusCodes.FORBIDDEN, 'Cannot change admin status');
  }

  return await prisma.user.update({
    where: { id: userId },
    data: { status },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });
};

export const getUserDetails = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      technicianProfile: {
        include: {
          services: true,
          availabilitySlots: true,
          bookings: { take: 5, orderBy: { createdAt: 'desc' } },
          reviewsReceived: { take: 5, orderBy: { createdAt: 'desc' } },
        },
      },
      bookingsAsCustomer: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          service: true,
          technician: {
            include: { user: { select: { name: true, email: true, phone: true } } },
          },
        },
      },
      payments: { take: 5, orderBy: { createdAt: 'desc' } },
      reviews: { take: 5, orderBy: { createdAt: 'desc' } },
      _count: {
        select: {
          bookingsAsCustomer: true,
          payments: true,
          reviews: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

// ==================== Booking Management ====================

export const getAllBookings = async (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const status = query.status as BookingStatus | undefined;
  const search = query.search as string | undefined;
  const startDate = query.startDate as string | undefined;
  const endDate = query.endDate as string | undefined;
  
  const skip = (page - 1) * limit;

  const where: Prisma.BookingWhereInput = {};

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { bookingNumber: { contains: search, mode: 'insensitive' } },
      { customer: { name: { contains: search, mode: 'insensitive' } } },
      { technician: { user: { name: { contains: search, mode: 'insensitive' } } } },
    ];
  }

  if (startDate && endDate) {
    where.scheduledDate = { gte: new Date(startDate), lte: new Date(endDate) };
  } else if (startDate) {
    where.scheduledDate = { gte: new Date(startDate) };
  } else if (endDate) {
    where.scheduledDate = { lte: new Date(endDate) };
  }

  const bookings = await prisma.booking.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      service: true,
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

export const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });

  if (!booking) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Booking not found');
  }

  const validTransitions: Record<BookingStatus, BookingStatus[]> = {
    REQUESTED: ['ACCEPTED', 'DECLINED', 'CANCELLED'],
    ACCEPTED: ['PAID', 'CANCELLED'],
    PAID: ['IN_PROGRESS', 'CANCELLED'],
    IN_PROGRESS: ['COMPLETED'],
    COMPLETED: [],
    DECLINED: [],
    CANCELLED: [],
  };

  if (!validTransitions[booking.status]?.includes(status)) {
    throw new AppError(StatusCodes.BAD_REQUEST, `Cannot transition from ${booking.status} to ${status}`);
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
    include: {
      customer: { select: { id: true, name: true, email: true, phone: true } },
      technician: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
      service: true,
      payment: true,
    },
  });

  if (status === 'COMPLETED') {
    await prisma.technicianProfile.update({
      where: { id: booking.technicianId },
      data: { completedJobs: { increment: 1 } },
    });
  }

  return updatedBooking;
};

// ==================== Dashboard ====================

export const getDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    bannedUsers,
    totalTechnicians,
    verifiedTechnicians,
    totalBookings,
    pendingBookings,
    completedBookings,
    totalRevenue,
    recentBookings,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { status: UserStatus.ACTIVE } }),
    prisma.user.count({ where: { status: UserStatus.BANNED } }),
    prisma.user.count({ where: { role: 'TECHNICIAN' } }),
    prisma.technicianProfile.count({ where: { isVerified: true } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: BookingStatus.REQUESTED } }),
    prisma.booking.count({ where: { status: BookingStatus.COMPLETED } }),
    prisma.payment.aggregate({ where: { status: 'COMPLETED' }, _sum: { amount: true } }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: { select: { name: true, email: true } },
        technician: { include: { user: { select: { name: true } } } },
        service: true,
      },
    }),
  ]);

  return {
    users: { 
      total: totalUsers, 
      active: activeUsers, 
      banned: bannedUsers 
    },
    technicians: { 
      total: totalTechnicians, 
      verified: verifiedTechnicians, 
      unverified: totalTechnicians - verifiedTechnicians 
    },
    bookings: { 
      total: totalBookings, 
      pending: pendingBookings, 
      completed: completedBookings 
    },
    revenue: { 
      total: totalRevenue._sum.amount || 0 
    },
    recentBookings,
  };
};

// ==================== Technician Management ====================

export const verifyTechnician = async (technicianId: string, isVerified: boolean) => {
  const technician = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
  });

  if (!technician) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Technician not found');
  }

  return await prisma.technicianProfile.update({
    where: { id: technicianId },
    data: { isVerified },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
};

// ==================== Category Management ====================

export const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategoryId?: string;
}) => {
  const existingCategory = await prisma.category.findFirst({
    where: { OR: [{ name: data.name }, { slug: data.slug }] },
  });

  if (existingCategory) {
    throw new AppError(StatusCodes.CONFLICT, 'Category with this name or slug already exists');
  }

  return await prisma.category.create({ data });
};

export const updateCategory = async (
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    image?: string;
    isActive?: boolean;
    parentCategoryId?: string | null;
  }
) => {
  const category = await prisma.category.findUnique({ where: { id } });

  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  if (data.name || data.slug) {
    const existingCategory = await prisma.category.findFirst({
      where: {
        OR: [
          data.name ? { name: data.name } : {},
          data.slug ? { slug: data.slug } : {},
        ],
        NOT: { id },
      },
    });

    if (existingCategory) {
      throw new AppError(StatusCodes.CONFLICT, 'Category with this name or slug already exists');
    }
  }

  return await prisma.category.update({ where: { id }, data });
};

export const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { services: true, subCategories: true },
  });

  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  if (category.services.length > 0 || category.subCategories.length > 0) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Cannot delete category with associated services or subcategories');
  }

  await prisma.category.delete({ where: { id } });
  return { id, message: 'Category deleted successfully' };
};

export const getAllCategories = async () => {
  return await prisma.category.findMany({
    where: { parentCategoryId: null },
    include: { subCategories: true, services: { take: 5 } },
    orderBy: { name: 'asc' },
  });
};

// ==================== Export ====================

export const AdminService = {
  getAllUsers,
  updateUserStatus,
  getUserDetails,
  getAllBookings,
  updateBookingStatus,
  getDashboardStats,
  verifyTechnician,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllCategories,
};

export default AdminService;
