import ApiError from '../utils/ApiError.js';

// Validates req[source] against a zod schema and replaces it with parsed data.
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const details = result.error.issues.map((i) => ({
        path: i.path.join('.'),
        message: i.message,
      }));
      return next(new ApiError(400, 'Validation failed', details));
    }
    req[source] = result.data;
    return next();
  };

export default validate;
