import { Router } from 'express';
import {
  startSession,
  stopSession,
  activeSession,
  history,
} from '../controllers/studyController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { studyStartSchema, studyStopSchema } from '../utils/validators.js';

const router = Router();

router.use(protect);
router.post('/start', validate(studyStartSchema), startSession);
router.post('/stop', validate(studyStopSchema), stopSession);
router.get('/active', activeSession);
router.get('/history', history);

export default router;
