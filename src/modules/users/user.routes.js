import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { getUserById, me } from './user.controller.js';

const router = Router();

router.get('/me', protect, me);
router.get('/:id', protect, getUserById);

export default router;