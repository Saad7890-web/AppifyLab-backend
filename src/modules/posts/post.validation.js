import { z } from 'zod';

const visibilitySchema = z.enum(['public', 'private']);

const optionalText = z.preprocess((value) => {
  if (typeof value !== 'string') return value;

  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}, z.string().min(1, 'Content cannot be empty').max(5000).optional());

export const createPostSchema = z.object({
  content: optionalText,
  visibility: visibilitySchema.default('public')
});

export const updatePostSchema = z.object({
  content: optionalText,
  visibility: visibilitySchema.optional()
}).refine(
  (data) => data.content !== undefined || data.visibility !== undefined,
  {
    message: 'At least one field is required'
  }
);