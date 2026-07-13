import Subject from '../../models/Subject.js';
import Attendance from '../../models/Attendance.js';
import Exam from '../../models/Exam.js';
import Timetable from '../../models/Timetable.js';
import StudySession from '../../models/StudySession.js';
import Semester from '../../models/Semester.js';
import { computeFreeSlots } from './schedule.js';
import { rankSubjects } from './priority.js';
import { attendancePercent } from './academics.js';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

// Gathers everything the analytics/AI layers need for a user.
export async function buildAcademicContext(userId, { day } = {}) {
  const activeSemester =
    (await Semester.findOne({ userId, active: true })) ||
    (await Semester.findOne({ userId }).sort({ semesterNumber: -1 }));

  const subjectFilter = { userId };
  if (activeSemester) subjectFilter.semesterId = activeSemester._id;

  const [subjects, attendance, exams, timetable] = await Promise.all([
    Subject.find(subjectFilter),
    Attendance.find({ userId }),
    Exam.find({ userId }),
    Timetable.find({ userId }),
  ]);

  const attendanceMap = {};
  for (const a of attendance) attendanceMap[String(a.subjectId)] = a;
  const examMap = {};
  for (const e of exams) {
    const key = String(e.subjectId);
    // keep the nearest upcoming exam per subject
    if (!examMap[key] || new Date(e.examDate) < new Date(examMap[key].examDate)) {
      examMap[key] = e;
    }
  }

  const ranked = rankSubjects(subjects, { attendanceMap, examMap });
  const freeSlots = computeFreeSlots(timetable);
  const targetDay = day || DAY_NAMES[new Date().getDay()];

  // recent study minutes per subject (last 7 days)
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recent = await StudySession.aggregate([
    { $match: { userId, endTime: { $ne: null }, startTime: { $gte: since } } },
    { $group: { _id: '$subjectId', minutes: { $sum: '$duration' } } },
  ]);
  const subjectName = {};
  for (const s of subjects) subjectName[String(s._id)] = s.name;
  const recentStudy = recent.map((r) => ({
    subject: subjectName[String(r._id)] || 'Unknown',
    minutes: r.minutes,
  }));

  return {
    activeSemester,
    subjects,
    attendanceMap,
    examMap,
    ranked,
    freeSlots,
    targetDay,
    recentStudy,
    attendancePercentOf: (subjectId) => {
      const a = attendanceMap[String(subjectId)];
      return a ? attendancePercent(a.present, a.absent) : null;
    },
  };
}

export { DAY_NAMES };
