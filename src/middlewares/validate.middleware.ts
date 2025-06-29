// src/middlewares/validate.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError } from 'zod';

export const validate =
  (schema: AnyZodObject) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => { // Explicitly add return type for clarity
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      // Validation passed, proceed to the next middleware/controller
      next();
    } catch (error) {
      // Validation failed.
      if (error instanceof ZodError) {
        // Send a structured error response
        res.status(400).json(error.errors);
      } else {
        // Handle other potential errors
        res.status(500).json({ message: 'Internal Server Error during validation' });
      }
      // IMPORTANT: We do not call next() here because the request is terminated.
      // IMPORTANT: We do NOT 'return' the response.
    }
  };