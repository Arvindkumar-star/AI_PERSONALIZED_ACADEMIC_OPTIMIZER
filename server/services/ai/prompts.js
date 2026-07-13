const RULES = `Rules:
- Use ONLY the provided numbers. Do NOT recompute or invent attendance % or SGPA.
- Schedule study tasks ONLY inside the provided free slots.
- Times must be "HH:mm" (24h). Keep tasks realistic (25-90 min) with short breaks.
- Prioritize subjects with higher priorityScore, nearer exams, and low attendance.
- Respond with valid JSON ONLY, matching the requested schema exactly.`;

export function dailyPlanPrompt(ctx) {
  return `You are an academic daily planner. Build a realistic study schedule for ${ctx.day}.

Student:
- Name: ${ctx.user.name}
- Daily study goal (hours): ${ctx.user.dailyStudyGoal}
- Target SGPA: ${ctx.user.targetSGPA}

Ranked subjects (priorityScore precomputed by backend):
${JSON.stringify(ctx.subjects, null, 2)}

Free slots available today (${ctx.day}):
${JSON.stringify(ctx.freeSlots, null, 2)}

Recent study history (minutes per subject, last 7 days):
${JSON.stringify(ctx.recentStudy, null, 2)}

${RULES}

Return JSON:
{
  "summary": "one short paragraph",
  "tasks": [
    { "subject": "", "start": "HH:mm", "end": "HH:mm", "reason": "" }
  ]
}`;
}

export function priorityPrompt(ctx) {
  return `Explain the study priorities for this student. The backend already computed priorityScore and breakdowns; do not change the numbers, only interpret them.

Ranked subjects:
${JSON.stringify(ctx.ranked, null, 2)}

${RULES}

Return JSON:
{
  "summary": "one short paragraph",
  "priorities": [
    { "subject": "", "priorityScore": 0, "focus": "what to do", "reason": "" }
  ]
}`;
}

export function lifePlanPrompt(ctx) {
  return `You are a life & study optimizer. Design a balanced weekly routine that fits classes, uses free slots for study, and protects sleep, meals and breaks.

Student:
- Daily study goal (hours): ${ctx.user.dailyStudyGoal}
- Target SGPA: ${ctx.user.targetSGPA}

Ranked subjects:
${JSON.stringify(ctx.subjects, null, 2)}

Weekly free slots by day:
${JSON.stringify(ctx.freeSlotsByDay, null, 2)}

${RULES}

Return JSON:
{
  "summary": "one short paragraph",
  "week": [
    { "day": "Monday", "blocks": [ { "start": "HH:mm", "end": "HH:mm", "activity": "", "type": "study|break|meal|sleep|class|other" } ] }
  ],
  "habits": [ "short actionable habit" ]
}`;
}
