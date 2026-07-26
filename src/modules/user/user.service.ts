import { Prisma, UserStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../../config/prisma';
import config from '../../config/env';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

// ==================== Get User Profile ====================
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      profileImage: true,
      role: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

// ==================== Update Profile ====================
export const updateProfile = async (
  userId: string,
  data: {
    name?: string;
    phone?: string;
    address?: string;
    profileImage?: string;
  }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      address: true,
      profileImage: true,
      role: true,
      status: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// ==================== Change Password ====================
export const changePassword = async (
  userId: string,
  data: {
    currentPassword: string;
    newPassword: string;
  }
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Verify current password
  const isPasswordValid = await bcrypt.compare(data.currentPassword, user.password);

  if (!isPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Current password is incorrect');
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(data.newPassword, config.bcryptSaltRounds);

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
    select: {
      id: true,
      email: true,
      name: true,
      updatedAt: true,
    },
  });

  return updatedUser;
};

// ==================== Get All Users (Admin) ====================
export const getAllUsers = async (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const search = query.search as string | undefined;
  const role = query.role as string | undefined;
  const status = query.status as UserStatus | undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (role) {
    where.role = role as any;
  }

  if (status) {
    where.status = status;
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
      address: true,
      profileImage: true,
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

// ==================== Get User by ID (Admin) ====================
export const getUserById = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      technicianProfile: {
        include: {
          services: true,
          bookings: {
            take: 5,
            orderBy: { createdAt: 'desc' },
          },
        },
      },
      bookingsAsCustomer: {
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          service: true,
          technician: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true,
                },
              },
            },
          },
        },
      },
      reviews: {
        take: 5,
        orderBy: { createdAt: 'desc' },
      },
      _count: {
        select: {
          bookingsAsCustomer: true,
          reviews: true,
          payments: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return user;
};

// ==================== Update User Status (Admin) ====================
export const updateUserStatus = async (userId: string, status: UserStatus) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (user.role === 'ADMIN') {
    throw new AppError(StatusCodes.FORBIDDEN, 'Cannot change admin status');
  }

  const updatedUser = await prisma.user.update({
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

  return updatedUser;
};

export const UserService = {
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  getUserById,
  updateUserStatus,
};

export default UserService;