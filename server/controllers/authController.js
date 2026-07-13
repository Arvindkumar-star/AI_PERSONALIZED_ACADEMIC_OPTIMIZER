import asyncHandler from 'express-async-handler';
import User from '../models/User.js';
import ApiError from '../utils/ApiError.js';
import { signToken } from '../utils/token.js';

// POST /api/auth/register
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, ...profile } = req.body;

  const exists = await User.findOne({ email });
  if (exists) throw new ApiError(409, 'Email already registered');

  const user = new User({ name, email, ...profile });
  await user.setPassword(password);
  await user.save();

  const token = signToken({ sub: user._id });
  res.status(201).json({ token, user: user.toSafeJSON() });
});

// POST /api/auth/login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+passwordHash');
  if (!user) throw new ApiError(401, 'Invalid credentials');

  const ok = await user.comparePassword(password);
  if (!ok) throw new ApiError(401, 'Invalid credentials');

  const token = signToken({ sub: user._id });
  res.json({ token, user: user.toSafeJSON() });
});

// GET /api/auth/me
export const me = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});
