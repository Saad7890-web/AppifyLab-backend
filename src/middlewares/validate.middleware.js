import { ApiError } from '../utils/api-error.js';

export function validate(schema, location = 'body') {
  return (req, res, next) => {
  console.log('Before validation:', req.query);

    const data = req[location];

    const result = schema.safeParse(data);

    if (!result.success) {
      const message = result.error.errors?.[0]?.message || 'Validation failed';
      return next(new ApiError(400, message));
    }

    if (location === 'query') {
      req.validatedQuery = result.data;
    } else if (location === 'body') {
      req.validatedBody = result.data;
    } else if (location === 'params') {
      req.validatedParams = result.data;
    }

    next();
  };
}