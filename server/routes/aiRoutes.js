import { Router } from 'express';
import {
  aiStatus,
  dailyPlan,
  priority,
  lifePlan,
  aura,
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);
router.get('/status', aiStatus);
router.post('/daily-plan', dailyPlan);
router.post('/priority', priority);
router.post('/life-plan', lifePlan);
router.post('/aura', aura);

export default router;
