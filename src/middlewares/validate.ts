import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny, ZodError } from 'zod';

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
            error: 'Validation Error',
            details: error.errors.map((e) => ({
                path: e.path.join('.'),
                message: e.message
            }))
        });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  };

