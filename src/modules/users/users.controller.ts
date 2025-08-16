import { Request, Response, NextFunction } from 'express';
import { userService } from './users.service';
import { AppError } from '../../utils/error';
import { 
  CreateUserInput, 
  UpdateUserInput, 
  UserParams, 
  GetUsersQuery 
} from './users.validation';

/**
 * Controller class for handling user-related HTTP requests
 * Each method handles a specific endpoint and delegates business logic to the service layer
 */
export class UserController {
  /**
   * Get all users with optional filtering and pagination
   * GET /api/users
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = req.query as unknown as GetUsersQuery;
      const result = await userService.getUsers(query);

      res.status(200).json({
        status: 'success',
        message: 'Users retrieved successfully',
        data: result.users,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific user by ID
   * GET /api/users/:id
   */
  async getUserById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as UserParams;
      const user = await userService.getUserById(id);

      res.status(200).json({
        status: 'success',
        message: 'User retrieved successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new user
   * POST /api/users
   */
  async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body as CreateUserInput;
      const user = await userService.createUser(userData);

      res.status(201).json({
        status: 'success',
        message: 'User created successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an existing user
   * PUT /api/users/:id
   */
  async updateUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as UserParams;
      const updateData = req.body as UpdateUserInput;

      // Check if request body is empty
      if (!updateData || Object.keys(updateData).length === 0) {
        throw new AppError('No update data provided', 400);
      }

      const user = await userService.updateUser(id, updateData);

      res.status(200).json({
        status: 'success',
        message: 'User updated successfully',
        data: user,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a user
   * DELETE /api/users/:id
   */
  async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params as UserParams;
      await userService.deleteUser(id);

      res.status(200).json({
        status: 'success',
        message: 'User deleted successfully',
        data: null,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();