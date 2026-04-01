import { sendSuccess } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { addCommentToPost, addReplyToComment, deleteComment, getPostComments, updateComment } from './comment.service.js';

export const listCommentsForPost = asyncHandler(async (req, res) => {
  const { postId } = req.params;

  const comments = await getPostComments(postId, req.user.id);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Comments fetched successfully',
    data: { comments }
  });
});

export const createPostComment = asyncHandler(async (req, res) => {
  const { postId } = req.params;
  const { body } = req.body;

  const comment = await addCommentToPost({
    postId,
    userId: req.user.id,
    body
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Comment created successfully',
    data: { comment }
  });
});

export const createReply = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { body } = req.body;

  const reply = await addReplyToComment({
    commentId,
    userId: req.user.id,
    body
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Reply created successfully',
    data: { reply }
  });
});

export const editComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { body } = req.body;

  const comment = await updateComment({
    commentId,
    userId: req.user.id,
    body
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Comment updated successfully',
    data: { comment }
  });
});

export const removeComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  await deleteComment({
    commentId,
    userId: req.user.id
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Comment deleted successfully'
  });
});