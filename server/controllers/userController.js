import asyncHandler from 'express-async-handler';

// GET /api/users/me/profile
export const getProfile = asyncHandler(async (req, res) => {
  res.json({ user: req.user.toSafeJSON() });
});

// PUT /api/users/me/profile
export const updateProfile = asyncHandler(async (req, res) => {
  Object.assign(req.user, req.body);
  await req.user.save();
  res.json({ user: req.user.toSafeJSON() });
});
