import asyncHandler from 'express-async-handler';
import Semester from '../models/Semester.js';
import Subject from '../models/Subject.js';
import ApiError from '../utils/ApiError.js';
import { computeSGPA } from '../services/analytics/academics.js';

// GET /api/semesters
export const listSemesters = asyncHandler(async (req, res) => {
  const semesters = await Semester.find({ userId: req.user._id }).sort({
    semesterNumber: 1,
  });
  res.json({ semesters });
});

// POST /api/semesters
export const createSemester = asyncHandler(async (req, res) => {
  const { active, ...rest } = req.body;
  if (active) {
    await Semester.updateMany({ userId: req.user._id }, { active: false });
  }
  const semester = await Semester.create({
    ...rest,
    active: Boolean(active),
    userId: req.user._id,
  });
  res.status(201).json({ semester });
});

// PUT /api/semesters/:id
export const updateSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!semester) throw new ApiError(404, 'Semester not found');

  if (req.body.active === true) {
    await Semester.updateMany(
      { userId: req.user._id, _id: { $ne: semester._id } },
      { active: false }
    );
  }
  Object.assign(semester, req.body);
  await semester.save();
  res.json({ semester });
});

// DELETE /api/semesters/:id
export const deleteSemester = asyncHandler(async (req, res) => {
  const semester = await Semester.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!semester) throw new ApiError(404, 'Semester not found');
  await Subject.deleteMany({ semesterId: semester._id });
  res.json({ success: true });
});

// GET /api/semesters/:id/sgpa
export const getSemesterSGPA = asyncHandler(async (req, res) => {
  const semester = await Semester.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!semester) throw new ApiError(404, 'Semester not found');
  const subjects = await Subject.find({ semesterId: semester._id });
  const sgpa = computeSGPA(subjects);
  const totalCredits = subjects.reduce((a, s) => a + (s.credits || 0), 0);
  res.json({ semesterId: semester._id, sgpa, totalCredits });
});
