import asyncHandler from 'express-async-handler';
import Subject from '../models/Subject.js';
import Semester from '../models/Semester.js';
import Attendance from '../models/Attendance.js';
import Exam from '../models/Exam.js';
import StudySession from '../models/StudySession.js';
import ApiError from '../utils/ApiError.js';

// GET /api/subjects?semesterId=...
export const listSubjects = asyncHandler(async (req, res) => {
  const filter = { userId: req.user._id };
  if (req.query.semesterId) filter.semesterId = req.query.semesterId;
  const subjects = await Subject.find(filter).sort({ name: 1 });
  res.json({ subjects });
});

// POST /api/subjects
export const createSubject = asyncHandler(async (req, res) => {
  const semester = await Semester.findOne({
    _id: req.body.semesterId,
    userId: req.user._id,
  });
  if (!semester) throw new ApiError(400, 'Invalid semesterId');

  const subject = await Subject.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ subject });
});

// PUT /api/subjects/:id
export const updateSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!subject) throw new ApiError(404, 'Subject not found');
  Object.assign(subject, req.body);
  await subject.save();
  res.json({ subject });
});

// DELETE /api/subjects/:id
export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!subject) throw new ApiError(404, 'Subject not found');
  await Promise.all([
    Attendance.deleteOne({ subjectId: subject._id }),
    Exam.deleteMany({ subjectId: subject._id }),
    StudySession.deleteMany({ subjectId: subject._id }),
  ]);
  res.json({ success: true });
});
