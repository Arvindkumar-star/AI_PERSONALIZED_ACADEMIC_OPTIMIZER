import asyncHandler from 'express-async-handler';
import { buildAcademicContext } from '../services/analytics/context.js';
import { generateJSON, aiEnabled } from '../services/ai/provider.js';
import {
  dailyPlanPrompt,
  priorityPrompt,
  lifePlanPrompt,
} from '../services/ai/prompts.js';

const rankedForPrompt = (ranked) =>
  ranked.map((r) => ({
    subject: r.subject,
    credits: r.credits,
    difficulty: r.difficulty,
    attendancePercent: r.attendancePercent,
    daysUntilExam: r.daysUntilExam,
    preparationStatus: r.preparationStatus,
    priorityScore: r.priority,
  }));

// GET /api/ai/status
export const aiStatus = asyncHandler(async (_req, res) => {
  res.json({ enabled: aiEnabled() });
});

// POST /api/ai/daily-plan
export const dailyPlan = asyncHandler(async (req, res) => {
  const day = req.body?.day;
  const ctx = await buildAcademicContext(req.user._id, { day });

  const prompt = dailyPlanPrompt({
    day: ctx.targetDay,
    user: req.user.toSafeJSON(),
    subjects: rankedForPrompt(ctx.ranked),
    freeSlots: ctx.freeSlots[ctx.targetDay] || [],
    recentStudy: ctx.recentStudy,
  });

  const plan = await generateJSON(prompt);
  res.json({ day: ctx.targetDay, plan });
});

// POST /api/ai/priority
export const priority = asyncHandler(async (req, res) => {
  const ctx = await buildAcademicContext(req.user._id);
  // Backend computes the scores; AI only interprets them.
  const ranked = rankedForPrompt(ctx.ranked);
  const prompt = priorityPrompt({ ranked });
  const insight = await generateJSON(prompt);
  res.json({ ranked: ctx.ranked, insight });
});

// POST /api/ai/life-plan
export const lifePlan = asyncHandler(async (req, res) => {
  const ctx = await buildAcademicContext(req.user._id);
  const prompt = lifePlanPrompt({
    user: req.user.toSafeJSON(),
    subjects: rankedForPrompt(ctx.ranked),
    freeSlotsByDay: ctx.freeSlots,
  });
  const plan = await generateJSON(prompt);
  res.json({ plan });
});
