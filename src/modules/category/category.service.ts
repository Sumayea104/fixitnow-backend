import prisma from '../../config/prisma';
import AppError from '../../errors/AppError';
import { StatusCodes } from 'http-status-codes';

// ==================== Get All Categories (Public) ====================
const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      subCategories: {
        where: { isActive: true },
      },
      _count: {
        select: {
          services: true,
        },
      },
    },
    orderBy: {
      name: 'asc',
    },
  });

  return categories;
};

// ==================== Create Category (Admin Only) ====================
const createCategory = async (data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  parentCategoryId?: string;
}) => {
  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [{ name: data.name }, { slug: data.slug }],
    },
  });

  if (existingCategory) {
    throw new AppError(StatusCodes.CONFLICT, 'Category with this name or slug already exists');
  }

  const category = await prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description,
      icon: data.icon,
      image: data.image,
      parentCategoryId: data.parentCategoryId,
      isActive: true,
    },
    include: {
      subCategories: true,
    },
  });

  return category;
};

// ==================== Update Category (Admin Only) ====================
const updateCategory = async (
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
        OR: [data.name ? { name: data.name } : {}, data.slug ? { slug: data.slug } : {}],
        NOT: { id },
      },
    });

    if (existingCategory) {
      throw new AppError(StatusCodes.CONFLICT, 'Category with this name or slug already exists');
    }
  }

  const updatedCategory = await prisma.category.update({
    where: { id },
    data,
    include: {
      subCategories: true,
    },
  });

  return updatedCategory;
};

// ==================== Delete Category (Admin Only) ====================
const deleteCategory = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      services: true,
      subCategories: true,
    },
  });

  if (!category) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Category not found');
  }

  if (category.services.length > 0 || category.subCategories.length > 0) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Cannot delete category with associated services or subcategories'
    );
  }

  await prisma.category.delete({ where: { id } });

  return { id, message: 'Category deleted successfully' };
};

export const CategoryService = {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default CategoryService;