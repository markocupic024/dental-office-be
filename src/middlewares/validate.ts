import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';
import { ERROR_CODES } from '../utils/errors';

// Map Zod error codes to our error codes
const mapZodErrorToCode = (zodError: ZodError['errors'][0]): string => {
  const code = zodError.code;
  if (code === 'invalid_type' && zodError.received === 'undefined') {
    return ERROR_CODES.REQUIRED_FIELD;
  }
  if (code === 'invalid_string' && zodError.validation === 'email') {
    return ERROR_CODES.INVALID_EMAIL;
  }
  if (code === 'invalid_date' || (code === 'invalid_type' && zodError.expected === 'date')) {
    return ERROR_CODES.INVALID_DATE;
  }
  if (code === 'invalid_string' && zodError.validation === 'uuid') {
    return ERROR_CODES.INVALID_UUID;
  }
  // Default to validation error
  return ERROR_CODES.VALIDATION_ERROR;
};

export const validate =
  (schema: ZodTypeAny) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate only the body for simplicity, as most schemas expect direct body data
      await schema.parseAsync(req.body);
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
            error: ERROR_CODES.VALIDATION_ERROR,
            details: error.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message,
                code: mapZodErrorToCode(e)
            }))
        });
      }
      return res.status(500).json({ error: ERROR_CODES.INTERNAL_SERVER_ERROR });
    }
  };

