import { Router } from 'express';
import {
  listExams,
  createExam,
  updateExam,
  deleteExam,
} from '../controllers/examController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { examSchema, examUpdateSchema } from '../utils/validators.js';

const router = Router();

router.use(protect);
router.get('/', listExams);
router.post('/', validate(examSchema), createExam);
router.put('/:id', validate(examUpdateSchema), updateExam);
router.delete('/:id', deleteExam);

export default router;
