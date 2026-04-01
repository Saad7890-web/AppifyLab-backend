import { ApiError } from '../utils/api-error.js';

export function validate(schema, property = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[property]);

    if (!result.success) {
      const message = result.error.issues[0]?.message || 'Validation failed';
      throw new ApiError(400, message);
    }

    req[property] = result.data;
    next();
  };
}