import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/error';
import config from "../config"

/**
 * Interface for standardized error responses
 */
interface ErrorResponse {
  status: 'error';
  message: string;
  errors?: Array<{
    path: string;
    message: string;
  }>;
  stack?: string;
}

/**
 * Global error handling middleware. It Handles both operational errors (AppError) and unexpected errors
 */
export const errorHandler = (
  error: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // Default error values
  let statusCode = 500;
  let message = 'Internal Server Error';
  let isOperational = false;

  // If it's our custom AppError, use its properties
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;
    isOperational = error.isOperational;
  }

  // Log error for debugging (in production, use proper logging service)
  console.error({
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    statusCode,
    message: error.message,
    stack: error.stack,
    isOperational,
    body: req.body,
    params: req.params,
    query: req.query,
  });

  // Prepare error response
  const errorResponse: ErrorResponse = {
    status: 'error',
    message,
  };

  // Include stack trace in development
  if (config.NODE_ENV === 'development') {
    errorResponse.stack = error.stack;
  }

  // Send error response
  res.status(statusCode).json(errorResponse);
};

/**
 * Middleware to handle 404 errors for undefined routes
 */
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const error = new AppError(
    `Route ${req.method} ${req.originalUrl} not found`,
    404
  );
  next(error);
};

