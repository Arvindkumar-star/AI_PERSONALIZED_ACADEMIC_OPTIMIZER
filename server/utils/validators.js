import { z } from 'zod';
import { DAYS } from '../models/Timetable.js';

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  college: z.string().max(200).optional(),
  branch: z.string().max(200).optional(),
  semester: z.coerce.number().int().min(1).optional(),
  targetSGPA: z.coerce.number().min(0).max(10).optional(),
  dailyStudyGoal: z.coerce.number().min(0).max(24).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  college: z.string().max(200).optional(),
  branch: z.string().max(200).optional(),
  semester: z.coerce.number().int().min(1).optional(),
  targetSGPA: z.coerce.number().min(0).max(10).optional(),
  dailyStudyGoal: z.coerce.number().min(0).max(24).optional(),
});

export const semesterSchema = z.object({
  semesterNumber: z.coerce.number().int().min(1),
  cgpa: z.coerce.number().min(0).max(10).optional(),
  active: z.boolean().optional(),
});

export const subjectSchema = z.object({
  semesterId: z.string().min(1, 'semesterId is required'),
  name: z.string().min(1, 'Name is required').max(200),
  credits: z.coerce.number().positive('Credits must be > 0'),
  faculty: z.string().max(200).optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
  internalMarks: z.coerce.number().min(0).optional(),
  endSemesterMarks: z.coerce.number().min(0).optional(),
});

export const subjectUpdateSchema = subjectSchema.partial();

export const timetableSchema = z
  .object({
    day: z.enum(DAYS),
    startTime: z.string().regex(TIME_RE, 'startTime must be HH:mm'),
    endTime: z.string().regex(TIME_RE, 'endTime must be HH:mm'),
    subject: z.string().min(1).max(200),
    type: z.enum(['lecture', 'lab', 'tutorial', 'other']).optional(),
    location: z.string().max(200).optional(),
  })
  .refine((d) => d.startTime < d.endTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export const timetableUpdateSchema = z
  .object({
    day: z.enum(DAYS).optional(),
    startTime: z.string().regex(TIME_RE, 'startTime must be HH:mm').optional(),
    endTime: z.string().regex(TIME_RE, 'endTime must be HH:mm').optional(),
    subject: z.string().min(1).max(200).optional(),
    type: z.enum(['lecture', 'lab', 'tutorial', 'other']).optional(),
    location: z.string().max(200).optional(),
  })
  .refine((d) => !d.startTime || !d.endTime || d.startTime < d.endTime, {
    message: 'endTime must be after startTime',
    path: ['endTime'],
  });

export const attendanceSchema = z.object({
  subjectId: z.string().min(1, 'subjectId is required'),
  present: z.coerce.number().int().min(0).optional(),
  absent: z.coerce.number().int().min(0).optional(),
  requiredPercent: z.coerce.number().min(0).max(100).optional(),
});

export const attendanceUpdateSchema = z.object({
  present: z.coerce.number().int().min(0).optional(),
  absent: z.coerce.number().int().min(0).optional(),
  requiredPercent: z.coerce.number().min(0).max(100).optional(),
});

export const examSchema = z.object({
  subjectId: z.string().min(1, 'subjectId is required'),
  examDate: z.coerce.date({ invalid_type_error: 'Invalid exam date' }),
  preparationStatus: z
    .enum(['not-started', 'in-progress', 'revising', 'ready'])
    .optional(),
  internalMarks: z.coerce.number().min(0).optional(),
});

export const examUpdateSchema = examSchema.partial().omit({ subjectId: true });

export const studyStartSchema = z.object({
  subjectId: z.string().min(1, 'subjectId is required'),
});

export const studyStopSchema = z.object({
  sessionId: z.string().min(1, 'sessionId is required'),
});
