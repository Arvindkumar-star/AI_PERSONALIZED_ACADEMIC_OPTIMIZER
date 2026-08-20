/*
 * AURA Decision Engine
 *
 * This file contains deterministic decision logic.
 * Gemini is NOT responsible for calculating priorities.
 *
 * The engine analyzes the academic state and produces
 * actionable recommendations that AURA can explain.
 */

export function buildDecisionState(
  academicState = {}
) {
  const {
    attendance = [],
    exams = [],
    study = {},
    freeTime = {},
    subjectPriorities = [],
  } = academicState;

  const actions = [];

  // -----------------------------------------
  // 1. ATTENDANCE RISKS
  // -----------------------------------------

  const criticalAttendance =
    attendance.filter(
      (item) =>
        item.attendanceRisk === 'critical'
    );

  const atRiskAttendance =
    attendance.filter(
      (item) =>
        item.attendanceRisk === 'at-risk'
    );

  for (const item of criticalAttendance) {
    actions.push({
      type: 'ATTENDANCE_CRITICAL',
      subject: item.subject,
      urgency: 'high',

      reason:
        'Attendance is critically below the required percentage.',

      data: {
        attendancePercent:
          item.attendancePercent,

        requiredPercent:
          item.requiredPercent,

        classesNeeded:
          item.classesNeeded,
      },
    });
  }

  for (const item of atRiskAttendance) {
    actions.push({
      type: 'ATTENDANCE_RISK',
      subject: item.subject,
      urgency: 'medium',

      reason:
        'Attendance is below the required percentage.',

      data: {
        attendancePercent:
          item.attendancePercent,

        requiredPercent:
          item.requiredPercent,

        classesNeeded:
          item.classesNeeded,
      },
    });
  }

  // -----------------------------------------
  // 2. EXAM URGENCY
  // -----------------------------------------

  const urgentExams =
    exams
      .filter(
        (exam) =>
          exam.daysUntilExam !== null &&
          exam.daysUntilExam >= 0
      )
      .sort(
        (a, b) =>
          a.daysUntilExam -
          b.daysUntilExam
      );

  for (const exam of urgentExams.slice(0, 3)) {
    let urgency = 'low';

    if (exam.daysUntilExam <= 3) {
      urgency = 'critical';
    } else if (exam.daysUntilExam <= 7) {
      urgency = 'high';
    } else if (exam.daysUntilExam <= 14) {
      urgency = 'medium';
    }

    actions.push({
      type: 'EXAM_URGENCY',
      subject: exam.subject,
      urgency,

      reason:
        'An upcoming examination requires preparation.',

      data: {
        daysUntilExam:
          exam.daysUntilExam,

        preparationStatus:
          exam.preparationStatus,
      },
    });
  }

  // -----------------------------------------
  // 3. STUDY NEGLECT
  // -----------------------------------------

  const studyBreakdown =
    study.subjectBreakdown || [];

  const neglectedSubjects =
    subjectPriorities.filter(
      (priority) => {
        const studied =
          studyBreakdown.find(
            (item) =>
              String(item.subjectId) ===
              String(priority.subjectId)
          );

        return (
          !studied ||
          studied.minutes === 0
        );
      }
    );

  for (
    const subject of neglectedSubjects.slice(
      0,
      3
    )
  ) {
    actions.push({
      type: 'STUDY_NEGLECT',
      subject: subject.subject,
      urgency: 'medium',

      reason:
        'This high-priority subject has received little or no recent study time.',

      data: {
        priorityScore:
          subject.priorityScore,
      },
    });
  }

  // -----------------------------------------
  // 4. AVAILABLE STUDY TIME
  // -----------------------------------------

  const availableMinutes =
    Number(
      freeTime.totalAvailableMinutes || 0
    );

  if (availableMinutes > 0) {
    actions.push({
      type: 'AVAILABLE_STUDY_TIME',
      subject: null,
      urgency: 'normal',

      reason:
        'Study time is currently available.',

      data: {
        minutes:
          availableMinutes,

        hours:
          freeTime.totalAvailableHours,
      },
    });
  }

  // -----------------------------------------
  // 5. STUDY GOAL
  // -----------------------------------------

  if (
    study.dailyGoalMinutes > 0 &&
    study.averageDailyGoalCompletion < 75
  ) {
    actions.push({
      type: 'STUDY_GOAL_RISK',
      subject: null,
      urgency: 'medium',

      reason:
        'Recent study time is below the daily study goal.',

      data: {
        dailyGoalMinutes:
          study.dailyGoalMinutes,

        averageDailyMinutes:
          study.averageDailyMinutes,

        completion:
          study.averageDailyGoalCompletion,
      },
    });
  }

  // -----------------------------------------
  // SORT ACTIONS BY URGENCY
  // -----------------------------------------

  const urgencyRank = {
    critical: 4,
    high: 3,
    medium: 2,
    normal: 1,
    low: 0,
  };

  actions.sort(
    (a, b) =>
      urgencyRank[b.urgency] -
      urgencyRank[a.urgency]
  );

  // -----------------------------------------
  // PRIMARY ACTION
  // -----------------------------------------

  const primaryAction =
    actions.length > 0
      ? actions[0]
      : {
          type: 'NO_URGENT_ACTION',
          subject: null,
          urgency: 'normal',
          reason:
            'No urgent academic issue was detected.',
          data: {},
        };

  return {
    primaryAction,
    actions,
    availableStudyMinutes:
      availableMinutes,
    totalActions:
      actions.length,
  };
}
