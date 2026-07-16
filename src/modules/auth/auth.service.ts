import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { UserRole, UserStatus } from '../../generated/prisma';
import prisma from '../../config/prisma';
import config from '../../config/env';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

const register = async (data: {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: UserRole;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    throw new AppError(StatusCodes.CONFLICT, 'User already exists with this email');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(data.password, config.bcryptSaltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: data.role,
      status: UserStatus.ACTIVE,
    },
  });

  // If role is TECHNICIAN, create technician profile
  if (data.role === UserRole.TECHNICIAN) {
    await prisma.technicianProfile.create({
      data: {
        userId: user.id,
        skills: [],
        isAvailable: true,
      },
    });
  }

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as any
  );

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

const login = async (data: { email: string; password: string }) => {
  // Find user
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (!user) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  // Check if user is banned
  if (user.status === UserStatus.BANNED) {
    throw new AppError(StatusCodes.FORBIDDEN, 'Your account has been banned');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(data.password, user.password);

  if (!isPasswordValid) {
    throw new AppError(StatusCodes.UNAUTHORIZED, 'Invalid email or password');
  }

  // Update last login
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  // Generate JWT token
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn } as any
  );

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    token,
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      technicianProfile: true,
    },
  });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  // Remove password from response
  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

export const AuthService = {
  register,
  login,
  getMe,
};

export default AuthService;