import asyncHandler from 'express-async-handler';
import Attendance from '../models/Attendance.js';
import Subject from '../models/Subject.js';
import ApiError from '../utils/ApiError.js';
import {
  attendancePercent,
  bunkableClasses,
  classesNeeded,
} from '../services/analytics/academics.js';

function decorate(a) {
  const percent = attendancePercent(a.present, a.absent);
  return {
    ...a.toObject(),
    percent,
    meetsRequirement: percent >= a.requiredPercent,
    canBunk: bunkableClasses(a.present, a.absent, a.requiredPercent),
    mustAttend: classesNeeded(a.present, a.absent, a.requiredPercent),
  };
}

// GET /api/attendance
export const listAttendance = asyncHandler(async (req, res) => {
  const records = await Attendance.find({ userId: req.user._id }).populate(
    'subjectId',
    'name credits'
  );
  res.json({ attendance: records.map(decorate) });
});

// POST /api/attendance  (create or upsert for a subject)
export const upsertAttendance = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({
    _id: req.body.subjectId,
    userId: req.user._id,
  });
  if (!subject) throw new ApiError(400, 'Invalid subjectId');

  const record = await Attendance.findOneAndUpdate(
    { subjectId: subject._id, userId: req.user._id },
    { ...req.body, userId: req.user._id },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );
  res.status(201).json({ attendance: decorate(record) });
});

// PUT /api/attendance/:id
export const updateAttendance = asyncHandler(async (req, res) => {
  const record = await Attendance.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!record) throw new ApiError(404, 'Attendance record not found');
  Object.assign(record, req.body);
  await record.save();
  res.json({ attendance: decorate(record) });
});
