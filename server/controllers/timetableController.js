import asyncHandler from 'express-async-handler';
import Timetable from '../models/Timetable.js';
import ApiError from '../utils/ApiError.js';
import { computeFreeSlots } from '../services/analytics/schedule.js';

// GET /api/timetable
export const listTimetable = asyncHandler(async (req, res) => {
  const entries = await Timetable.find({ userId: req.user._id }).sort({
    day: 1,
    startTime: 1,
  });
  res.json({ entries });
});

// POST /api/timetable
export const createTimetable = asyncHandler(async (req, res) => {
  const entry = await Timetable.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ entry });
});

// PUT /api/timetable/:id
export const updateTimetable = asyncHandler(async (req, res) => {
  const entry = await Timetable.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  Object.assign(entry, req.body);
  await entry.save();
  res.json({ entry });
});

// DELETE /api/timetable/:id
export const deleteTimetable = asyncHandler(async (req, res) => {
  const entry = await Timetable.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!entry) throw new ApiError(404, 'Timetable entry not found');
  res.json({ success: true });
});

// GET /api/timetable/free-slots
export const getFreeSlots = asyncHandler(async (req, res) => {
  const entries = await Timetable.find({ userId: req.user._id });
  const freeSlots = computeFreeSlots(entries);
  res.json({ freeSlots });
});
