import { Router } from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import semesterRoutes from './semesterRoutes.js';
import subjectRoutes from './subjectRoutes.js';
import timetableRoutes from './timetableRoutes.js';
import attendanceRoutes from './attendanceRoutes.js';
import examRoutes from './examRoutes.js';
import studyRoutes from './studyRoutes.js';
import dashboardRoutes from './dashboardRoutes.js';
import aiRoutes from './aiRoutes.js';

const router = Router();

router.get('/health', (_req, res) => res.json({ status: 'ok' }));
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/semesters', semesterRoutes);
router.use('/subjects', subjectRoutes);
router.use('/timetable', timetableRoutes);
router.use('/attendance', attendanceRoutes);
router.use('/exams', examRoutes);
router.use('/study', studyRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/ai', aiRoutes);

export default router;
