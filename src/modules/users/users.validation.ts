import { z } from 'zod';

// Base user schema with all fields
const userSchema = z.object({
  id: z.string().uuid(),
  fullName: z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
  bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
  avatarUrl: z.string().url('Invalid avatar URL format').optional(),
  dateOfBirth: z.coerce.date().optional(),
  location: z.string().max(100, 'Location must be less than 100 characters').optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Schema for creating a new user
export const createUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for updating an existing user
export const updateUserSchema = userSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Schema for user response (what gets returned from API)
export const userResponseSchema = userSchema;

// Schema for validating user ID parameter
export const userParamsSchema = z.object({
  id: z.string().uuid('Invalid user ID format'),
});

// Schema for query parameters 
export const getUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(10).optional(),
  search: z.string().optional(),
  location: z.string().optional(),
  sortBy: z.enum(['fullName', 'email', 'createdAt', 'updatedAt']).default('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
});

// Types
export type User = z.infer<typeof userSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UserParams = z.infer<typeof userParamsSchema>;
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;

/**
 * Validation schemas for API requests
 */
export const createUserValidationSchema = z.object({
  body: createUserSchema,
});

export const updateUserValidationSchema = z.object({
  params: userParamsSchema,
  body: updateUserSchema,
});

export const userParamsValidationSchema = z.object({
  params: userParamsSchema,
});

export const getUsersValidationSchema = z.object({
  query: getUsersQuerySchema,
});
