import { pool } from '../../config/db.js';
import { ApiError } from '../../utils/api-error.js';
import {
    decrementLikeCount,
    deleteLike,
    findCommentLikeTargetById,
    findLikeByUserAndTarget,
    findPostLikeTargetById,
    getLikeState,
    incrementLikeCount,
    insertLike,
    listLikers
} from './like.repository.js';

function mapUser(row) {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    avatarUrl: row.avatar_url,
    likedAt: row.liked_at
  };
}

async function assertLikeTargetAccess(client, { targetType, targetId, userId }) {
  if (targetType === 'post') {
    const post = await findPostLikeTargetById(client, targetId);

    if (!post || post.deleted_at) {
      throw new ApiError(404, 'Post not found');
    }

    if (post.visibility === 'private' && String(post.author_id) !== String(userId)) {
      throw new ApiError(403, 'You are not allowed to like this post');
    }

    return post;
  }

  const comment = await findCommentLikeTargetById(client, targetId);

  if (!comment || comment.comment_deleted_at || comment.post_deleted_at) {
    throw new ApiError(404, 'Comment not found');
  }

  if (
    comment.post_visibility === 'private' &&
    String(comment.post_author_id) !== String(userId)
  ) {
    throw new ApiError(403, 'You are not allowed to like this comment');
  }

  return comment;
}

export async function toggleLike({ userId, targetType, targetId }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await assertLikeTargetAccess(client, { targetType, targetId, userId });

    const existingLike = await findLikeByUserAndTarget(client, {
      userId,
      targetType,
      targetId
    });

    let liked;

    if (existingLike) {
      const deleted = await deleteLike(client, {
        userId,
        targetType,
        targetId
      });

      if (!deleted) {
        throw new ApiError(500, 'Could not unlike target');
      }

      const updatedCount = await decrementLikeCount(client, {
        targetType,
        targetId
      });

      liked = false;

      await client.query('COMMIT');

      return {
        liked,
        likeCount: updatedCount?.like_count || 0
      };
    }

    const inserted = await insertLike(client, {
      userId,
      targetType,
      targetId
    });

    if (!inserted) {
      throw new ApiError(500, 'Could not like target');
    }

    const updatedCount = await incrementLikeCount(client, {
      targetType,
      targetId
    });

    liked = true;

    await client.query('COMMIT');

    return {
      liked,
      likeCount: updatedCount?.like_count || 0
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getLikeSummary({ userId, targetType, targetId }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await assertLikeTargetAccess(client, { targetType, targetId, userId });

    const state = await getLikeState(client, {
      userId,
      targetType,
      targetId
    });

    await client.query('COMMIT');
    return state;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getLikers({ userId, targetType, targetId, limit, offset }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await assertLikeTargetAccess(client, { targetType, targetId, userId });

    const users = await listLikers(client, {
      targetType,
      targetId,
      limit,
      offset
    });

    const state = await getLikeState(client, {
      userId,
      targetType,
      targetId
    });

    await client.query('COMMIT');

    return {
      users: users.map(mapUser),
      likeCount: state.likeCount,
      likedByMe: state.likedByMe
    };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}