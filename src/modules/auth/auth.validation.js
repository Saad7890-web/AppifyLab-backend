import { z } from 'zod';

export const registerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().email('Valid email is required').transform((value) => value.toLowerCase()),
  password: z.string().min(8, 'Password must be at least 8 characters').max(128)
});

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email is required').transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'Password is required')
});