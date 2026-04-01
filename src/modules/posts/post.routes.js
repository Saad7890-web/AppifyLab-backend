import { Router } from 'express';
import { requireOwnership, requirePostAccess } from '../../middlewares/access-control.middleware.js';
import { protect } from '../../middlewares/auth.middleware.js';
import { uploadPostImage } from '../../middlewares/upload.middleware.js';
import { validate } from '../../middlewares/validate.middleware.js';
import {
    createPost,
    deletePost,
    getPostById,
    updatePost
} from './post.controller.js';
import { findPostById } from './post.repository.js';
import { createPostSchema, updatePostSchema } from './post.validation.js';

const router = Router();

router.post(
  '/',
  protect,
  uploadPostImage.single('image'),
  validate(createPostSchema),
  createPost
);

router.get(
  '/:id',
  protect,
  requirePostAccess(findPostById, {
    paramName: 'id',
    attachTo: 'post'
  }),
  getPostById
);

router.patch(
  '/:id',
  protect,
  requireOwnership(findPostById, {
    resourceName: 'Post',
    ownerField: 'author_id',
    paramName: 'id',
    attachTo: 'resource'
  }),
  uploadPostImage.single('image'),
  validate(updatePostSchema),
  updatePost
);

router.delete(
  '/:id',
  protect,
  requireOwnership(findPostById, {
    resourceName: 'Post',
    ownerField: 'author_id',
    paramName: 'id',
    attachTo: 'resource'
  }),
  deletePost
);

export default router;