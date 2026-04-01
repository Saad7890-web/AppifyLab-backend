import { Router } from 'express';
import { protect } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
    getTargetLikeState,
    getTargetLikers,
    toggleTargetLike
} from './like.controller.js';
import { likeTargetParamsSchema } from './like.validation.js';

const router = Router();

router.post(
  '/:targetType/:targetId/toggle',
  protect,
  validate(likeTargetParamsSchema, 'params'),
  toggleTargetLike
);

router.get(
  '/:targetType/:targetId',
  protect,
  validate(likeTargetParamsSchema, 'params'),
  getTargetLikeState
);

router.get(
  '/:targetType/:targetId/users',
  protect,
  validate(likeTargetParamsSchema, 'params'),
  getTargetLikers
);

export default router;