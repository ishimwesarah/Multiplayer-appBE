// src/schemas/auth.schema.ts
import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Not a valid email'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
    role: z.enum(['ADMIN', 'CREATOR']).optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Not a valid email'),
    password: z.string().min(6, 'Password is required'),
  }),
});