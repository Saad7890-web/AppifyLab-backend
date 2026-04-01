import { pool } from '../../config/db.js';

export async function findCommentById(id) {
  const query = `
    SELECT
      c.id,
      c.post_id,
      c.author_id,
      c.parent_comment_id,
      c.body,
      c.like_count,
      c.reply_count,
      c.created_at,
      c.updated_at,
      c.deleted_at,
      u.first_name AS author_first_name,
      u.last_name AS author_last_name,
      u.avatar_url AS author_avatar_url,
      u.email AS author_email
    FROM comments c
    INNER JOIN users u ON u.id = c.author_id
    WHERE c.id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function findCommentsByPostId(postId) {
  const query = `
    SELECT
      c.id,
      c.post_id,
      c.author_id,
      c.parent_comment_id,
      c.body,
      c.like_count,
      c.reply_count,
      c.created_at,
      c.updated_at,
      c.deleted_at,
      u.first_name AS author_first_name,
      u.last_name AS author_last_name,
      u.avatar_url AS author_avatar_url,
      u.email AS author_email
    FROM comments c
    INNER JOIN users u ON u.id = c.author_id
    WHERE c.post_id = $1
      AND c.parent_comment_id IS NULL
      AND c.deleted_at IS NULL
    ORDER BY c.created_at ASC
  `;

  const result = await pool.query(query, [postId]);
  return result.rows;
}

export async function findRepliesByPostId(postId) {
  const query = `
    SELECT
      c.id,
      c.post_id,
      c.author_id,
      c.parent_comment_id,
      c.body,
      c.like_count,
      c.reply_count,
      c.created_at,
      c.updated_at,
      c.deleted_at,
      u.first_name AS author_first_name,
      u.last_name AS author_last_name,
      u.avatar_url AS author_avatar_url,
      u.email AS author_email
    FROM comments c
    INNER JOIN users u ON u.id = c.author_id
    WHERE c.post_id = $1
      AND c.parent_comment_id IS NOT NULL
      AND c.deleted_at IS NULL
    ORDER BY c.created_at ASC
  `;

  const result = await pool.query(query, [postId]);
  return result.rows;
}

export async function createComment({
  postId,
  authorId,
  body,
  parentCommentId = null
}) {
  const query = `
    INSERT INTO comments (post_id, author_id, parent_comment_id, body)
    VALUES ($1, $2, $3, $4)
    RETURNING id
  `;

  const result = await pool.query(query, [
    postId,
    authorId,
    parentCommentId,
    body
  ]);

  return result.rows[0];
}

export async function updateCommentBodyById(id, body) {
  const query = `
    UPDATE comments
    SET body = $2,
        updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, [id, body]);
  return result.rows[0] || null;
}

export async function softDeleteCommentById(id) {
  const query = `
    UPDATE comments
    SET body = '[deleted]',
        deleted_at = NOW(),
        updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function incrementPostCommentCount(client, postId) {
  const query = `
    UPDATE posts
    SET comment_count = comment_count + 1,
        updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING comment_count
  `;

  const result = await client.query(query, [postId]);
  return result.rows[0] || null;
}

export async function decrementPostCommentCount(client, postId) {
  const query = `
    UPDATE posts
    SET comment_count = GREATEST(comment_count - 1, 0),
        updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING comment_count
  `;

  const result = await client.query(query, [postId]);
  return result.rows[0] || null;
}

export async function incrementReplyCount(client, parentCommentId) {
  const query = `
    UPDATE comments
    SET reply_count = reply_count + 1,
        updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING reply_count
  `;

  const result = await client.query(query, [parentCommentId]);
  return result.rows[0] || null;
}

export async function decrementReplyCount(client, parentCommentId) {
  const query = `
    UPDATE comments
    SET reply_count = GREATEST(reply_count - 1, 0),
        updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING reply_count
  `;

  const result = await client.query(query, [parentCommentId]);
  return result.rows[0] || null;
}

export async function findPostForCommentAccess(client, postId) {
  const query = `
    SELECT id, author_id, visibility, deleted_at
    FROM posts
    WHERE id = $1
    LIMIT 1
  `;

  const result = await client.query(query, [postId]);
  return result.rows[0] || null;
}

export async function findCommentParentContext(client, commentId) {
  const query = `
    SELECT
      c.id,
      c.post_id,
      c.author_id,
      c.parent_comment_id,
      c.deleted_at,
      p.visibility AS post_visibility,
      p.author_id AS post_author_id,
      p.deleted_at AS post_deleted_at
    FROM comments c
    INNER JOIN posts p ON p.id = c.post_id
    WHERE c.id = $1
    LIMIT 1
  `;

  const result = await client.query(query, [commentId]);
  return result.rows[0] || null;
}