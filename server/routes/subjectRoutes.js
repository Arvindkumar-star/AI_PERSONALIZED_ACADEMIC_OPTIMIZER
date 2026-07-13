import { Router } from 'express';
import {
  listSubjects,
  createSubject,
  updateSubject,
  deleteSubject,
} from '../controllers/subjectController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { subjectSchema, subjectUpdateSchema } from '../utils/validators.js';

const router = Router();

router.use(protect);
router.get('/', listSubjects);
router.post('/', validate(subjectSchema), createSubject);
router.put('/:id', validate(subjectUpdateSchema), updateSubject);
router.delete('/:id', deleteSubject);

export default router;
