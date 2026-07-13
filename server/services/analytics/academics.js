// Pure calculation helpers. The backend performs ALL calculations;
// the LLM never computes attendance or SGPA.

const GRADE_POINTS = [
  { min: 90, point: 10 },
  { min: 80, point: 9 },
  { min: 70, point: 8 },
  { min: 60, point: 7 },
  { min: 50, point: 6 },
  { min: 40, point: 5 },
  { min: 0, point: 0 },
];

export function marksToGradePoint(marks) {
  const band = GRADE_POINTS.find((b) => marks >= b.min);
  return band ? band.point : 0;
}

// Attendance % = present / (present + absent) * 100
export function attendancePercent(present = 0, absent = 0) {
  const total = present + absent;
  if (total === 0) return 0;
  return Number(((present / total) * 100).toFixed(2));
}

// Classes a student can still skip while staying at/above requiredPercent.
export function bunkableClasses(present = 0, absent = 0, requiredPercent = 75) {
  const total = present + absent;
  if (total === 0) return 0;
  const r = requiredPercent / 100;
  // present / (total + x) >= r  =>  x <= present/r - total
  const x = Math.floor(present / r - total);
  return Math.max(0, x);
}

// Classes needed to reach requiredPercent (attending all of them).
export function classesNeeded(present = 0, absent = 0, requiredPercent = 75) {
  const total = present + absent;
  const r = requiredPercent / 100;
  if (total === 0) return 0;
  if (present / total >= r) return 0;
  // (present + y) / (total + y) >= r  =>  y >= (r*total - present) / (1 - r)
  if (r >= 1) return Infinity;
  const y = Math.ceil((r * total - present) / (1 - r));
  return Math.max(0, y);
}

// SGPA = Σ(gradePoint × credits) / Σ(credits)
// subjects: [{ credits, gradePoint }] or [{ credits, endSemesterMarks }]
export function computeSGPA(subjects = []) {
  let weighted = 0;
  let credits = 0;
  for (const s of subjects) {
    const gp =
      typeof s.gradePoint === 'number'
        ? s.gradePoint
        : marksToGradePoint(s.endSemesterMarks || 0);
    weighted += gp * (s.credits || 0);
    credits += s.credits || 0;
  }
  if (credits === 0) return 0;
  return Number((weighted / credits).toFixed(2));
}

// CGPA = credit-weighted average of per-semester SGPA.
export function computeCGPA(semesters = []) {
  let weighted = 0;
  let credits = 0;
  for (const s of semesters) {
    weighted += (s.sgpa || 0) * (s.credits || 0);
    credits += s.credits || 0;
  }
  if (credits === 0) return 0;
  return Number((weighted / credits).toFixed(2));
}
