import { Router } from 'express';
import { requireOwnership } from '../../middlewares/access-control.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
    createPostComment,
    createReply,
    editComment,
    listCommentsForPost,
    removeComment
} from './comment.controller.js';
import { findCommentById } from './comment.repository.js';
import { commentBodySchema } from './comment.validation.js';

const router = Router();

router.get(
  '/post/:postId',
  protect,
  listCommentsForPost
);

router.post(
  '/post/:postId',
  protect,
  validate(commentBodySchema),
  createPostComment
);

router.post(
  '/:commentId/replies',
  protect,
  validate(commentBodySchema),
  createReply
);

router.patch(
  '/:commentId',
  protect,
  requireOwnership(findCommentById, {
    resourceName: 'Comment',
    ownerField: 'author_id',
    paramName: 'commentId',
    attachTo: 'resource'
  }),
  validate(commentBodySchema),
  editComment
);

router.delete(
  '/:commentId',
  protect,
  requireOwnership(findCommentById, {
    resourceName: 'Comment',
    ownerField: 'author_id',
    paramName: 'commentId',
    attachTo: 'resource'
  }),
  removeComment
);

export default router;