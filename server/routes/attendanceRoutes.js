import { Router } from 'express';
import {
  listAttendance,
  upsertAttendance,
  updateAttendance,
} from '../controllers/attendanceController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { attendanceSchema, attendanceUpdateSchema } from '../utils/validators.js';

const router = Router();

router.use(protect);
router.get('/', listAttendance);
router.post('/', validate(attendanceSchema), upsertAttendance);
router.put('/:id', validate(attendanceUpdateSchema), updateAttendance);

export default router;
