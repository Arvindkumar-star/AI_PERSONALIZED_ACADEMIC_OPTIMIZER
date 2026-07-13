import asyncHandler from 'express-async-handler';
import Timetable from '../models/Timetable.js';
import Exam from '../models/Exam.js';
import StudySession from '../models/StudySession.js';
import { buildAcademicContext, DAY_NAMES } from '../services/analytics/context.js';
import { attendancePercent } from '../services/analytics/academics.js';

// GET /api/dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const today = DAY_NAMES[new Date().getDay()];

  const ctx = await buildAcademicContext(userId, { day: today });

  const todaysClasses = await Timetable.find({ userId, day: today }).sort({
    startTime: 1,
  });

  const now = new Date();
  const upcomingExams = await Exam.find({ userId, examDate: { $gte: now } })
    .populate('subjectId', 'name')
    .sort({ examDate: 1 })
    .limit(5);

  // today's study minutes
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const todaySessions = await StudySession.find({
    userId,
    endTime: { $ne: null },
    startTime: { $gte: startOfDay },
  });
  const todayStudyMinutes = todaySessions.reduce((a, s) => a + s.duration, 0);

  // weekly study minutes per day (last 7 days) for charts
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 6);
  weekStart.setHours(0, 0, 0, 0);
  const weekSessions = await StudySession.find({
    userId,
    endTime: { $ne: null },
    startTime: { $gte: weekStart },
  }).populate('subjectId', 'name');

  const perDay = {};
  const perSubject = {};
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    perDay[DAY_NAMES[d.getDay()]] = 0;
  }
  for (const s of weekSessions) {
    const dayName = DAY_NAMES[new Date(s.startTime).getDay()];
    perDay[dayName] = (perDay[dayName] || 0) + s.duration;
    const name = s.subjectId?.name || 'Unknown';
    perSubject[name] = (perSubject[name] || 0) + s.duration;
  }
  const weeklyStudyMinutes = Object.values(perDay).reduce((a, b) => a + b, 0);

  const attendanceChart = Object.values(ctx.attendanceMap).length
    ? await Promise.all(
        ctx.subjects.map(async (s) => {
          const a = ctx.attendanceMap[String(s._id)];
          return {
            subject: s.name,
            percent: a ? attendancePercent(a.present, a.absent) : 0,
          };
        })
      )
    : [];

  res.json({
    cards: {
      todaysClasses,
      attendance: attendanceChart,
      upcomingExams,
      todayStudyHours: Number((todayStudyMinutes / 60).toFixed(2)),
      weeklyStudyHours: Number((weeklyStudyMinutes / 60).toFixed(2)),
      topPriorities: ctx.ranked.slice(0, 3),
    },
    charts: {
      studyHoursByDay: Object.entries(perDay).map(([day, minutes]) => ({
        day,
        hours: Number((minutes / 60).toFixed(2)),
      })),
      attendanceBySubject: attendanceChart,
      timeBySubject: Object.entries(perSubject).map(([subject, minutes]) => ({
        subject,
        hours: Number((minutes / 60).toFixed(2)),
      })),
    },
  });
});
