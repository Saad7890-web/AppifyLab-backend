import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import { getFeed } from './feed.controller.js';
import { feedQuerySchema } from './feed.validation.js';

const router = Router();

router.get('/', protect, validate(feedQuerySchema, 'query'), getFeed);

export default router;