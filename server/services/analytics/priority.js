import { attendancePercent } from './academics.js';

const DIFFICULTY_WEIGHT = { easy: 1, medium: 2, hard: 3 };
const PREP_WEIGHT = {
  'not-started': 4,
  'in-progress': 3,
  revising: 2,
  ready: 0,
};

const daysUntil = (date) => {
  if (!date) return null;
  const ms = new Date(date).getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
};

// Nearer exams weigh more; no exam -> 0.
function examWeight(days) {
  if (days === null) return 0;
  if (days <= 0) return 12;
  if (days <= 3) return 10;
  if (days <= 7) return 7;
  if (days <= 14) return 4;
  if (days <= 30) return 2;
  return 1;
}

// Lower attendance -> higher urgency to attend (and manage) that subject.
function attendanceWeight(percent, requiredPercent = 75) {
  if (percent >= requiredPercent) return 0;
  const gap = requiredPercent - percent;
  return Number(Math.min(10, gap / 5).toFixed(2));
}

// priority = credits*3 + examWeight + difficultyWeight + attendanceWeight + prepWeight
export function computePriority(subject, { attendance, exam } = {}) {
  const credits = subject.credits || 0;
  const days = daysUntil(exam?.examDate);
  const attPct = attendance
    ? attendancePercent(attendance.present, attendance.absent)
    : 100;

  const parts = {
    creditsWeight: credits * 3,
    examWeight: examWeight(days),
    difficultyWeight: DIFFICULTY_WEIGHT[subject.difficulty] || 2,
    attendanceWeight: attendanceWeight(attPct, attendance?.requiredPercent),
    preparationWeight: exam ? PREP_WEIGHT[exam.preparationStatus] ?? 0 : 0,
  };

  const score = Number(
    Object.values(parts).reduce((a, b) => a + b, 0).toFixed(2)
  );

  return {
    subjectId: subject._id,
    subject: subject.name,
    credits,
    difficulty: subject.difficulty,
    attendancePercent: attPct,
    daysUntilExam: days,
    preparationStatus: exam?.preparationStatus || null,
    breakdown: parts,
    priority: score,
  };
}

export function rankSubjects(subjects, { attendanceMap, examMap } = {}) {
  return subjects
    .map((s) =>
      computePriority(s, {
        attendance: attendanceMap?.[String(s._id)],
        exam: examMap?.[String(s._id)],
      })
    )
    .sort((a, b) => b.priority - a.priority);
}
