import asyncHandler from 'express-async-handler';
import StudySession from '../models/StudySession.js';
import Subject from '../models/Subject.js';
import ApiError from '../utils/ApiError.js';

// POST /api/study/start
export const startSession = asyncHandler(async (req, res) => {
  const subject = await Subject.findOne({
    _id: req.body.subjectId,
    userId: req.user._id,
  });
  if (!subject) throw new ApiError(400, 'Invalid subjectId');

  const running = await StudySession.findOne({
    userId: req.user._id,
    endTime: null,
  });
  if (running) {
    throw new ApiError(409, 'A study session is already running', {
      sessionId: running._id,
    });
  }

  const session = await StudySession.create({
    userId: req.user._id,
    subjectId: subject._id,
    startTime: new Date(),
  });
  res.status(201).json({ session });
});

// POST /api/study/stop
export const stopSession = asyncHandler(async (req, res) => {
  const session = await StudySession.findOne({
    _id: req.body.sessionId,
    userId: req.user._id,
  });
  if (!session) throw new ApiError(404, 'Study session not found');
  if (session.endTime) throw new ApiError(400, 'Session already stopped');

  session.endTime = new Date();
  session.duration = Math.max(
    0,
    Math.round((session.endTime - session.startTime) / 60000)
  );
  await session.save();
  res.json({ session });
});

// GET /api/study/active
export const activeSession = asyncHandler(async (req, res) => {
  const session = await StudySession.findOne({
    userId: req.user._id,
    endTime: null,
  }).populate('subjectId', 'name');
  res.json({ session });
});

// GET /api/study/history
export const history = asyncHandler(async (req, res) => {
  const sessions = await StudySession.find({
    userId: req.user._id,
    endTime: { $ne: null },
  })
    .populate('subjectId', 'name')
    .sort({ startTime: -1 })
    .limit(200);
  res.json({ sessions });
});
