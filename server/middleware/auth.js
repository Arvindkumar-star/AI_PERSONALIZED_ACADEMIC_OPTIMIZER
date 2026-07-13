import asyncHandler from 'express-async-handler';
import ApiError from '../utils/ApiError.js';
import { verifyToken } from '../utils/token.js';
import User from '../models/User.js';

export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Not authorized, no token');
  }

  let decoded;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Not authorized, token invalid');
  }

  const user = await User.findById(decoded.sub);
  if (!user) {
    throw new ApiError(401, 'Not authorized, user not found');
  }

  req.user = user;
  next();
});

export default protect;
