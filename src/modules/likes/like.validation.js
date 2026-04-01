import { z } from 'zod';

export const likeTargetParamsSchema = z.object({
  targetType: z.enum(['post', 'comment']),
  targetId: z.string().uuid('Valid target id is required')
});