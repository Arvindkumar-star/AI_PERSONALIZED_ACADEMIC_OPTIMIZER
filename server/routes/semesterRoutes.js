import { Router } from 'express';
import {
  listSemesters,
  createSemester,
  updateSemester,
  deleteSemester,
  getSemesterSGPA,
} from '../controllers/semesterController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { semesterSchema } from '../utils/validators.js';

const router = Router();

router.use(protect);
router.get('/', listSemesters);
router.post('/', validate(semesterSchema), createSemester);
router.put('/:id', updateSemester);
router.delete('/:id', deleteSemester);
router.get('/:id/sgpa', getSemesterSGPA);

export default router;
