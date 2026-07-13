import asyncHandler from 'express-async-handler';
import Exam from '../models/Exam.js';
import Subject from '../models/Subject.js';
import ApiError from '../utils/ApiError.js';

// GET /api/exams
export const listExams = asyncHandler(async (req, res) => {
  const exams = await Exam.find({ userId: req.user._id })
    .populate('subjectId', 'name credits')
    .sort({ examDate: 1 });
  res.json({ exams });
});

// POST /api/exams
export const createExam = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({
    _id: req.body.subjectId,
    userId: req.user._id,
  });
  if (!subject) throw new ApiError(400, 'Invalid subjectId');
  const exam = await Exam.create({ ...req.body, userId: req.user._id });
  res.status(201).json({ exam });
});

// PUT /api/exams/:id
export const updateExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOne({ _id: req.params.id, userId: req.user._id });
  if (!exam) throw new ApiError(404, 'Exam not found');
  Object.assign(exam, req.body);
  await exam.save();
  res.json({ exam });
});

// DELETE /api/exams/:id
export const deleteExam = asyncHandler(async (req, res) => {
  const exam = await Exam.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!exam) throw new ApiError(404, 'Exam not found');
  res.json({ success: true });
});
