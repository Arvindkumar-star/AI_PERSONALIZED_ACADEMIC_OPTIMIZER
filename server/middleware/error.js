import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';

export function notFound(req, _res, next) {
  next(new ApiError(404, `Not found: ${req.method} ${req.originalUrl}`));
}

export function errorHandler(err, _req, res, _next) {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details;

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `Duplicate value for ${field}`;
  }

  // Mongoose validation
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    details = Object.values(err.errors).map((e) => ({
      path: e.path,
      message: e.message,
    }));
  }

  // Invalid ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  const payload = { message };
  if (details) payload.details = details;
  if (env.nodeEnv !== 'production' && statusCode === 500) {
    payload.stack = err.stack;
  }

  res.status(statusCode).json(payload);
}
