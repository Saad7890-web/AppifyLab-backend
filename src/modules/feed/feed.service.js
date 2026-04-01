import { ApiError } from '../../utils/api-error.js';
import { decodeFeedCursor, encodeFeedCursor } from '../../utils/pagination.js';
import { getFeedPosts } from './feed.repository.js';

function mapPost(row) {
  return {
    id: row.id,
    authorId: row.author_id,
    author: {
      id: row.author_id,
      firstName: row.author_first_name,
      lastName: row.author_last_name,
      email: row.author_email,
      avatarUrl: row.author_avatar_url
    },
    content: row.content,
    imageUrl: row.image_url,
    imageKey: row.image_key,
    visibility: row.visibility,
    likeCount: Number(row.like_count),
    commentCount: Number(row.comment_count),
    likedByMe: row.liked_by_me,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export async function fetchFeed({ userId, limit, cursor }) {
  const decodedCursor = decodeFeedCursor(cursor);

  if (cursor && !decodedCursor) {
    throw new ApiError(400, 'Invalid cursor');
  }

  const rows = await getFeedPosts({
    userId,
    limit,
    cursorCreatedAt: decodedCursor?.createdAt || null,
    cursorId: decodedCursor?.id || null
  });

  const hasMore = rows.length > limit;
  const slice = hasMore ? rows.slice(0, limit) : rows;

  const posts = slice.map(mapPost);

  const lastPost = posts[posts.length - 1] || null;
  const nextCursor = hasMore && lastPost
    ? encodeFeedCursor({
        createdAt: lastPost.createdAt,
        id: lastPost.id
      })
    : null;

  return {
    posts,
    pageInfo: {
      hasMore,
      nextCursor
    }
  };
}