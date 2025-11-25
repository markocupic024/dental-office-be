import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError, ERROR_CODES, ErrorCode } from '../utils/errors';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let errorCode: ErrorCode = ERROR_CODES.INTERNAL_SERVER_ERROR;
  let message = 'Internal Server Error';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    message = err.message;
  } else {
    statusCode = err.statusCode || 500;
    message = err.message || 'Internal Server Error';
  }

  logger.error(
    `${statusCode} - ${errorCode} - ${message} - ${req.originalUrl} - ${req.method} - ${req.ip}`
  );
  if (err.stack) {
    logger.error(err.stack);
  }

  res.status(statusCode).json({
    error: errorCode,
    ...(process.env.NODE_ENV === 'development' && { message, stack: err.stack }),
  });
};

