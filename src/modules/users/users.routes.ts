import { Router } from 'express';
import { userController } from './users.controller';
import { validate } from '../../middleware/validate.middleware';
import {
  getUsersValidationSchema,
  userParamsValidationSchema,
  createUserValidationSchema,
  updateUserValidationSchema
} from './users.validation';

const router = Router();

/**
 * @route   GET /api/users
 * @desc    Get all users with optional filtering and pagination
 * @access  Public
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10, max: 100)
 * @query   {string} search - Search in fullName, email, or bio
 * @query   {string} location - Filter by location
 * @query   {string} sortBy - Sort by field (fullName, email, createdAt, updatedAt)
 * @query   {string} sortOrder - Sort order (asc, desc)
 */
router.get(
  '/',
  validate(getUsersValidationSchema),
  userController.getUsers.bind(userController)
);

/**
 * @route   GET /api/users/:id
 * @desc    Get a specific user by ID
 * @access  Public
 * @params  {string} id - User UUID
 */
router.get(
  '/:id',
  validate(userParamsValidationSchema),
  userController.getUserById.bind(userController)
);

/**
 * @route   POST /api/users
 * @desc    Create a new user
 * @access  Public
 * @body    {CreateUserInput} userData - User data for creation
 */
router.post(
  '/',
  validate(createUserValidationSchema),
  userController.createUser.bind(userController)
);

/**
 * @route   PUT /api/users/:id
 * @desc    Update an existing user
 * @access  Public
 * @params  {string} id - User UUID
 * @body    {UpdateUserInput} updateData - User data for update (partial)
 */
router.put(
  '/:id',
  validate(updateUserValidationSchema),
  userController.updateUser.bind(userController)
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete a user
 * @access  Public
 * @params  {string} id - User UUID
 */
router.delete(
  '/:id',
  validate(userParamsValidationSchema),
  userController.deleteUser.bind(userController)
);

export { router as userRoutes };