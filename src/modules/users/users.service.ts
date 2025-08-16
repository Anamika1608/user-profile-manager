import { GetUsersQuery } from './users.validation';
import { AppError } from '../../utils/error';
import {prisma} from "../../lib/prisma"
import { Prisma } from '@prisma/client';

interface CreateUserData {
  fullName: string;
  email: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  location?: string;
}

interface UpdateUserData {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  bio?: string;
  avatarUrl?: string;
  dateOfBirth?: Date;
  location?: string;
}

export const userService = {
  // Create a new user
  async createUser(data: CreateUserData) {
    try {
      const user = await prisma.user.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber,
          bio: data.bio,
          avatarUrl: data.avatarUrl,
          dateOfBirth: data.dateOfBirth,
          location: data.location,
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new AppError('User with this email already exists', 409);
        }
      }
      throw new AppError('Failed to create user', 500);
    }
  },

  // Get user by ID
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  },

  // Get all users with filtering and pagination
  async getUsers(query: GetUsersQuery) {
    try {
      const page = query.page || 1;
      const limit = query.limit || 10;
      const skip = (page - 1) * limit;
      
      // Build where clause for filtering
      const where: Prisma.UserWhereInput = {};
      
      // Apply search filter (searches in fullName, email, and bio)
      if (query.search) {
        const searchTerm = query.search;
        where.OR = [
          {
            fullName: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
          {
            bio: {
              contains: searchTerm,
              mode: 'insensitive',
            },
          },
        ];
      }

      // Apply location filter
      if (query.location) {
        where.location = {
          contains: query.location,
          mode: 'insensitive',
        };
      }

      // Build orderBy clause
      const sortBy = query.sortBy || 'createdAt';
      const sortOrder = query.sortOrder || 'desc';
      
      const orderBy: Prisma.UserOrderByWithRelationInput = {
        [sortBy]: sortOrder,
      };

      // Execute queries in parallel for better performance
      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          orderBy,
          skip,
          take: limit,
        }),
        prisma.user.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        users,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    } catch (error) {
      throw new AppError('Failed to retrieve users', 500);
    }
  },

  // Update user
  async updateUser(id: string, data: UpdateUserData) {
    try {
      const user = await prisma.user.update({
        where: { id },
        data: {
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.email !== undefined && { email: data.email }),
          ...(data.phoneNumber !== undefined && { phoneNumber: data.phoneNumber }),
          ...(data.bio !== undefined && { bio: data.bio }),
          ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
          ...(data.dateOfBirth !== undefined && { dateOfBirth: data.dateOfBirth }),
          ...(data.location !== undefined && { location: data.location }),
        },
      });

      return user;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('User not found', 404);
        }
        if (error.code === 'P2002') {
          throw new AppError('User with this email already exists', 409);
        }
      }
      throw new AppError('Failed to update user', 500);
    }
  },

  // Delete user
  async deleteUser(id: string) {
    try {
      await prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new AppError('User not found', 404);
        }
      }
      throw new AppError('Failed to delete user', 500);
    }
  },

  // Check if user exists
  async userExists(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!user;
  },
};