import { z } from 'zod';

export const commentBodySchema = z.object({
  body: z.string().trim().min(1, 'Comment body is required').max(5000)
});