import Subject from '../../models/Subject.js';
import Attendance from '../../models/Attendance.js';
import Exam from '../../models/Exam.js';
import Timetable from '../../models/Timetable.js';
import StudySession from '../../models/StudySession.js';
import Semester from '../../models/Semester.js';

import { computeFreeSlots } from './schedule.js';
import { rankSubjects } from './priority.js';
import {
  attendancePercent,
  bunkableClasses,
  classesNeeded,
} from './academics.js';

const DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

function daysUntil(date) {
  if (!date) return null;

  const diff =
    new Date(date).getTime() - Date.now();

  return Math.ceil(
    diff / (1000 * 60 * 60 * 24)
  );
}

function buildAttendanceState(
  subjects,
  attendanceMap
) {
  return subjects.map((subject) => {
    const attendance =
      attendanceMap[String(subject._id)];

    if (!attendance) {
      return {
        subject: subject.name,
        subjectId: subject._id,
        present: 0,
        absent: 0,
        attendancePercent: null,
        requiredPercent: 75,
        attendanceRisk: 'unknown',
        classesCanSkip: 0,
        classesNeeded: 0,
      };
    }

    const percent = attendancePercent(
      attendance.present,
      attendance.absent
    );

    const required =
      attendance.requiredPercent ?? 75;

    let risk = 'safe';

    if (percent < required) {
      risk =
        percent < required - 10
          ? 'critical'
          : 'at-risk';
    }

    return {
      subject: subject.name,
      subjectId: subject._id,
      present: attendance.present,
      absent: attendance.absent,
      attendancePercent: percent,
      requiredPercent: required,
      attendanceRisk: risk,

      classesCanSkip: bunkableClasses(
        attendance.present,
        attendance.absent,
        required
      ),

      classesNeeded: Number.isFinite(
  classesNeeded(
    attendance.present,
    attendance.absent,
    required
  )
)
  ? classesNeeded(
      attendance.present,
      attendance.absent,
      required
    )
  : null,
    };
  });
}

function buildExamState(
  subjects,
  examMap
) {
  return subjects
    .map((subject) => {
      const exam =
        examMap[String(subject._id)];

      if (!exam) return null;

      return {
        subject: subject.name,
        subjectId: subject._id,
        examDate: exam.examDate,

        daysUntilExam:
          daysUntil(exam.examDate),

        preparationStatus:
          exam.preparationStatus,

        internalMarks:
          exam.internalMarks,
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.daysUntilExam === null)
        return 1;

      if (b.daysUntilExam === null)
        return -1;

      return (
        a.daysUntilExam -
        b.daysUntilExam
      );
    });
}

function buildStudyState(
  recentStudy,
  dailyStudyGoal
) {
  const totalRecentMinutes =
    recentStudy.reduce(
      (total, item) =>
        total + item.minutes,
      0
    );

  const dailyGoalMinutes =
    Math.round(
      (dailyStudyGoal || 0) * 60
    );

  const averageDailyMinutes =
    Math.round(
      totalRecentMinutes / 7
    );

  return {
    last7DaysMinutes:
      totalRecentMinutes,

    averageDailyMinutes,

    dailyGoalMinutes,

    dailyGoalHours:
      dailyStudyGoal || 0,

    averageDailyGoalCompletion:
      dailyGoalMinutes > 0
        ? Number(
            (
              (averageDailyMinutes /
                dailyGoalMinutes) *
              100
            ).toFixed(1)
          )
        : 0,

    subjectBreakdown:
      recentStudy,
  };
}

function buildFreeTimeState(
  freeSlots,
  targetDay
) {
  const todaySlots =
    freeSlots[targetDay] || [];

  const totalTodayMinutes =
    todaySlots.reduce(
      (total, slot) =>
        total + slot.minutes,
      0
    );

  return {
    targetDay,

    totalAvailableMinutes:
      totalTodayMinutes,

    totalAvailableHours:
      Number(
        (
          totalTodayMinutes / 60
        ).toFixed(2)
      ),

    slots: todaySlots,
  };
}

// Gathers the complete academic state required by analytics and AURA.
export async function buildAcademicContext(
  userId,
  { day, dailyStudyGoal } = {}
) {
  const activeSemester =
    (await Semester.findOne({
      userId,
      active: true,
    })) ||
    (await Semester.findOne({
      userId,
    }).sort({
      semesterNumber: -1,
    }));

  const subjectFilter = {
    userId,
  };

  if (activeSemester) {
    subjectFilter.semesterId =
      activeSemester._id;
  }

  const [
    subjects,
    attendance,
    exams,
    timetable,
  ] = await Promise.all([
    Subject.find(subjectFilter),

    Attendance.find({
      userId,
    }),

    Exam.find({
      userId,
    }),

    Timetable.find({
      userId,
    }),
  ]);

  // -----------------------------------------
  // Attendance map
  // -----------------------------------------

  const attendanceMap = {};

  for (const item of attendance) {
    attendanceMap[
      String(item.subjectId)
    ] = item;
  }

  // -----------------------------------------
  // Exam map
  // -----------------------------------------

  const examMap = {};

  for (const exam of exams) {
    const key =
      String(exam.subjectId);

    if (
      !examMap[key] ||
      new Date(exam.examDate) <
        new Date(
          examMap[key].examDate
        )
    ) {
      examMap[key] = exam;
    }
  }

  // -----------------------------------------
  // Backend-computed subject priorities
  // -----------------------------------------

  const ranked =
    rankSubjects(subjects, {
      attendanceMap,
      examMap,
    });

  // -----------------------------------------
  // Timetable / free slots
  // -----------------------------------------

  const freeSlots =
    computeFreeSlots(timetable);

  const targetDay =
    day ||
    DAY_NAMES[
      new Date().getDay()
    ];

  // -----------------------------------------
  // Recent study history
  // -----------------------------------------

  const since =
    new Date(
      Date.now() -
        7 *
          24 *
          60 *
          60 *
          1000
    );

  const recent =
    await StudySession.aggregate([
      {
        $match: {
          userId,

          endTime: {
            $ne: null,
          },

          startTime: {
            $gte: since,
          },
        },
      },

      {
        $group: {
          _id: '$subjectId',

          minutes: {
            $sum: '$duration',
          },
        },
      },
    ]);

  const subjectName = {};

  for (const subject of subjects) {
    subjectName[
      String(subject._id)
    ] = subject.name;
  }

  const recentStudy =
    recent.map((item) => ({
      subject:
        subjectName[
          String(item._id)
        ] || 'Unknown',

      subjectId:
        item._id,

      minutes:
        item.minutes,
    }));

  // -----------------------------------------
  // Build decision-oriented state
  // -----------------------------------------

  const attendanceState =
    buildAttendanceState(
      subjects,
      attendanceMap
    );

  const examState =
    buildExamState(
      subjects,
      examMap
    );

  const studyState =
    buildStudyState(
      recentStudy,
      dailyStudyGoal
    );

  const freeTimeState =
    buildFreeTimeState(
      freeSlots,
      targetDay
    );

  // -----------------------------------------
  // Return complete academic context
  // -----------------------------------------

  return {
    // Existing Version 1 context
    activeSemester,

    subjects,

    attendanceMap,

    examMap,

    ranked,

    freeSlots,

    targetDay,

    recentStudy,

    attendancePercentOf: (
      subjectId
    ) => {
      const item =
        attendanceMap[
          String(subjectId)
        ];

      return item
        ? attendancePercent(
            item.present,
            item.absent
          )
        : null;
    },

    // New Version 2 context
    academicState: {
      attendance:
        attendanceState,

      exams:
        examState,

      study:
        studyState,

      freeTime:
        freeTimeState,

      subjectPriorities:
        ranked,
    },
  };
}

export { DAY_NAMES };
