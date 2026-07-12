import { Prisma } from '../../generated/prisma';
import prisma from '../../config/prisma';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

// ==================== Create Service ====================
export const createService = async (technicianId: string, data: {
  categoryId: string;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  durationMinutes?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  images?: string[];
  tags?: string[];
}) => {
  // Check if technician exists
  const technician = await prisma.technicianProfile.findUnique({
    where: { id: technicianId },
  });

  if (!technician) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Technician profile not found');
  }

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });

  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  // Check if service with same title already exists for this technician
  const existingService = await prisma.service.findFirst({
    where: {
      technicianId,
      title: data.title,
    },
  });

  if (existingService) {
    throw new AppError(StatusCodes.CONFLICT, 'You already have a service with this title');
  }

  const service = await prisma.service.create({
    data: {
      technicianId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      price: data.price,
      discountedPrice: data.discountedPrice,
      durationMinutes: data.durationMinutes,
      isActive: data.isActive !== undefined ? data.isActive : true,
      isFeatured: data.isFeatured || false,
      images: data.images || [],
      tags: data.tags || [],
    },
    include: {
      category: true,
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
    },
  });

  return service;
};

// ==================== Get All Services (Public) ====================
export const getAllServices = async (query: any) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(parseInt(query.limit) || 10, 100);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  const category = query.category as string | undefined;
  const search = query.search as string | undefined;
  const minPrice = query.minPrice ? parseFloat(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? parseFloat(query.maxPrice) : undefined;
  const minRating = query.minRating ? parseFloat(query.minRating) : undefined;
  const technicianId = query.technicianId as string | undefined;
  const isFeatured = query.isFeatured as boolean | undefined;
  const location = query.location as string | undefined;

  const skip = (page - 1) * limit;

  const where: Prisma.ServiceWhereInput = {};

  where.isActive = true;

  if (category) {
    where.category = {
      OR: [
        { name: { contains: category, mode: 'insensitive' } },
        { slug: { contains: category, mode: 'insensitive' } },
      ],
    };
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search] } },
    ];
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) {
      where.price.gte = minPrice;
    }
    if (maxPrice !== undefined) {
      where.price.lte = maxPrice;
    }
  }

  if (minRating !== undefined) {
    where.technician = {
      averageRating: {
        gte: minRating,
      },
    };
  }

  if (technicianId) {
    where.technicianId = technicianId;
  }

  if (isFeatured !== undefined) {
    where.isFeatured = isFeatured;
  }

  if (location) {
    where.technician = {
      location: {
        contains: location,
        mode: 'insensitive',
      },
    };
  }

  const services = await prisma.service.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      category: true,
      technician: {
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
      },
      bookings: {
        where: {
          status: 'COMPLETED',
        },
        select: {
          review: {
            select: {
              rating: true,
            },
          },
        },
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  const servicesWithRating = services.map(service => {
    const reviews = service.bookings
      .map(b => b.review?.rating)
      .filter((r): r is number => r !== undefined && r !== null);
    
    const avgRating = reviews.length > 0
      ? parseFloat((reviews.reduce((a, b) => a + b, 0) / reviews.length).toFixed(1))
      : 0;

    const { bookings, ...serviceWithoutBookings } = service;
    return {
      ...serviceWithoutBookings,
      averageRating: avgRating,
      totalReviews: reviews.length,
    };
  });

  const total = await prisma.service.count({ where });

  return {
    services: servicesWithRating,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getServiceDetails = async (serviceId: string) => {
  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      category: true,
      technician: {
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
            where: {
              isActive: true,
              id: { not: serviceId },
            },
            take: 5,
          },
          availabilitySlots: {
            where: {
              isBooked: false,
              OR: [
                { isRecurring: true },
                { specificDate: { gte: new Date() } },
              ],
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
        },
      },
      bookings: {
        where: {
          status: 'COMPLETED',
        },
        select: {
          review: {
            select: {
              rating: true,
              comment: true,
              createdAt: true,
              customer: {
                select: {
                  id: true,
                  name: true,
                  profileImage: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      },
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  });

  if (!service) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Service not found');
  }

  const reviews = service.bookings
    .map(b => b.review)
    .filter((r): r is NonNullable<typeof r> => r !== null);
  
  const avgRating = reviews.length > 0
    ? parseFloat((reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1))
    : 0;

  const { bookings, ...serviceWithoutBookings } = service;
  return {
    ...serviceWithoutBookings,
    averageRating: avgRating,
    totalReviews: reviews.length,
    reviews: reviews,
  };
};

export const updateService = async (
  technicianId: string,
  serviceId: string,
  data: {
    categoryId?: string;
    title?: string;
    description?: string;
    price?: number;
    discountedPrice?: number | null;
    durationMinutes?: number;
    isActive?: boolean;
    isFeatured?: boolean;
    images?: string[];
    tags?: string[];
  }
) => {

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
  });

  if (!service) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Service not found');
  }

  if (service.technicianId !== technicianId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have permission to update this service');
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: { id: data.categoryId },
    });
    if (!category) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
    }
  }

  if (data.title && data.title !== service.title) {
    const existingService = await prisma.service.findFirst({
      where: {
        technicianId,
        title: data.title,
        id: { not: serviceId },
      },
    });
    if (existingService) {
      throw new AppError(StatusCodes.CONFLICT, 'You already have a service with this title');
    }
  }

  const updatedService = await prisma.service.update({
    where: { id: serviceId },
    data: {
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      price: data.price,
      discountedPrice: data.discountedPrice,
      durationMinutes: data.durationMinutes,
      isActive: data.isActive,
      isFeatured: data.isFeatured,
      images: data.images,
      tags: data.tags,
    },
    include: {
      category: true,
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
    },
  });

  return updatedService;
};

export const deleteService = async (technicianId: string, serviceId: string) => {

  const service = await prisma.service.findUnique({
    where: { id: serviceId },
    include: {
      bookings: {
        where: {
          status: { in: ['REQUESTED', 'ACCEPTED', 'PAID', 'IN_PROGRESS'] },
        },
      },
    },
  });

  if (!service) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Service not found');
  }

  if (service.technicianId !== technicianId) {
    throw new AppError(StatusCodes.FORBIDDEN, 'You do not have permission to delete this service');
  }

  if (service.bookings.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Cannot delete service with active bookings. Please complete or cancel bookings first.'
    );
  }

  await prisma.service.delete({
    where: { id: serviceId },
  });

  return { id: serviceId, message: 'Service deleted successfully' };
};

export const getTechnicianServices = async (technicianId: string) => {
  const services = await prisma.service.findMany({
    where: {
      technicianId,
    },
    include: {
      category: true,
      _count: {
        select: {
          bookings: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return services;
};

export const ServiceService = {
  createService,
  getAllServices,
  getServiceDetails,
  updateService,
  deleteService,
  getTechnicianServices,
};

export default ServiceService;