import { pool } from '../../config/db.js';
import { ApiError } from '../../utils/api-error.js';
import {
    createComment,
    decrementPostCommentCount,
    decrementReplyCount,
    findCommentById,
    findCommentParentContext,
    findCommentsByPostId,
    findPostForCommentAccess,
    findRepliesByPostId,
    incrementPostCommentCount,
    incrementReplyCount,
    softDeleteCommentById,
    updateCommentBodyById
} from './comment.repository.js';

function mapComment(row) {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    parentCommentId: row.parent_comment_id,
    body: row.body,
    likeCount: row.like_count,
    replyCount: row.reply_count,
    author: {
      id: row.author_id,
      firstName: row.author_first_name,
      lastName: row.author_last_name,
      avatarUrl: row.author_avatar_url,
      email: row.author_email
    },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at
  };
}

function buildThread(comments, replies) {
  const replyMap = new Map();

  for (const reply of replies) {
    const parentId = reply.parent_comment_id;
    if (!replyMap.has(parentId)) {
      replyMap.set(parentId, []);
    }
    replyMap.get(parentId).push(mapComment(reply));
  }

  return comments.map((comment) => {
    const mapped = mapComment(comment);
    mapped.replies = replyMap.get(comment.id) || [];
    return mapped;
  });
}

async function assertPostAccess(client, postId, userId) {
  const post = await findPostForCommentAccess(client, postId);

  if (!post || post.deleted_at) {
    throw new ApiError(404, 'Post not found');
  }

  if (post.visibility === 'private' && String(post.author_id) !== String(userId)) {
    throw new ApiError(403, 'You are not allowed to access this post');
  }

  return post;
}

async function assertParentCommentAccess(client, commentId, userId) {
  const context = await findCommentParentContext(client, commentId);

  if (!context || context.deleted_at || context.post_deleted_at) {
    throw new ApiError(404, 'Comment not found');
  }

  if (
    context.post_visibility === 'private' &&
    String(context.post_author_id) !== String(userId)
  ) {
    throw new ApiError(403, 'You are not allowed to reply to this comment');
  }

  return context;
}

export async function getPostComments(postId, userId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await assertPostAccess(client, postId, userId);

    const comments = await findCommentsByPostId(postId);
    const replies = await findRepliesByPostId(postId);

    await client.query('COMMIT');

    return buildThread(comments, replies);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function addCommentToPost({ postId, userId, body }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await assertPostAccess(client, postId, userId);

    const created = await createComment({
      postId,
      authorId: userId,
      body,
      parentCommentId: null
    });

    await incrementPostCommentCount(client, postId);

    const fullComment = await findCommentById(created.id);

    await client.query('COMMIT');

    return mapComment(fullComment);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function addReplyToComment({ commentId, userId, body }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const parent = await assertParentCommentAccess(client, commentId, userId);

    const created = await createComment({
      postId: parent.post_id,
      authorId: userId,
      body,
      parentCommentId: commentId
    });

    await incrementReplyCount(client, commentId);

    const fullReply = await findCommentById(created.id);

    await client.query('COMMIT');

    return mapComment(fullReply);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function updateComment({ commentId, userId, body }) {
  const current = await findCommentById(commentId);

  if (!current || current.deleted_at) {
    throw new ApiError(404, 'Comment not found');
  }

  if (String(current.author_id) !== String(userId)) {
    throw new ApiError(403, 'Forbidden');
  }

  const updated = await updateCommentBodyById(commentId, body);

  if (!updated) {
    throw new ApiError(404, 'Comment not found');
  }

  const fullComment = await findCommentById(commentId);
  return mapComment(fullComment);
}

export async function deleteComment({ commentId, userId }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const current = await findCommentById(commentId);

    if (!current || current.deleted_at) {
      throw new ApiError(404, 'Comment not found');
    }

    if (String(current.author_id) !== String(userId)) {
      throw new ApiError(403, 'Forbidden');
    }

    const deleted = await softDeleteCommentById(commentId);

    if (!deleted) {
      throw new ApiError(404, 'Comment not found');
    }

    if (current.parent_comment_id) {
      await decrementReplyCount(client, current.parent_comment_id);
    } else {
      await decrementPostCommentCount(client, current.post_id);
    }

    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}