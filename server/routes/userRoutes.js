import { Router } from 'express';
import { getProfile, updateProfile } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { updateProfileSchema } from '../utils/validators.js';

const router = Router();

router.use(protect);
router.get('/me/profile', getProfile);
router.put('/me/profile', validate(updateProfileSchema), updateProfile);

export default router;
