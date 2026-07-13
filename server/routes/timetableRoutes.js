import { Router } from 'express';
import {
  listTimetable,
  createTimetable,
  updateTimetable,
  deleteTimetable,
  getFreeSlots,
} from '../controllers/timetableController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { timetableSchema, timetableUpdateSchema } from '../utils/validators.js';

const router = Router();

router.use(protect);
router.get('/', listTimetable);
router.get('/free-slots', getFreeSlots);
router.post('/', validate(timetableSchema), createTimetable);
router.put('/:id', validate(timetableUpdateSchema), updateTimetable);
router.delete('/:id', deleteTimetable);

export default router;
