import { ApiError } from '../../utils/api-error.js';
import { sendSuccess } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import {
    createNewPost,
    deletePostService,
    getPostByIdService,
    updatePostService
} from './post.service.js';

export const createPost = asyncHandler(async (req, res) => {
  const post = await createNewPost(req.user.id, req.body, req.file);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Post created successfully',
    data: { post }
  });
});

export const getPostById = asyncHandler(async (req, res) => {
  if (!req.post) {
    throw new ApiError(404, 'Post not found');
  }

  const post = await getPostByIdService(req.post);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Post fetched successfully',
    data: { post }
  });
});

export const updatePost = asyncHandler(async (req, res) => {
  if (!req.resource) {
    throw new ApiError(404, 'Post not found');
  }

  const post = await updatePostService(req.resource, req.body, req.file);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Post updated successfully',
    data: { post }
  });
});

export const deletePost = asyncHandler(async (req, res) => {
  if (!req.resource) {
    throw new ApiError(404, 'Post not found');
  }

  await deletePostService(req.resource);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Post deleted successfully'
  });
});