import { pool } from '../../config/db.js';

export async function getFeedPosts({
  userId,
  limit = 20,
  cursorCreatedAt = null,
  cursorId = null
}) {
  const query = `
    SELECT
      p.id,
      p.author_id,
      p.content,
      p.image_url,
      p.image_key,
      p.visibility,
      p.like_count,
      p.comment_count,
      p.created_at,
      p.updated_at,
      u.first_name AS author_first_name,
      u.last_name AS author_last_name,
      u.email AS author_email,
      u.avatar_url AS author_avatar_url,
      EXISTS (
        SELECT 1
        FROM likes l
        WHERE l.user_id = $1
          AND l.target_type = 'post'
          AND l.target_id = p.id
      ) AS liked_by_me
    FROM posts p
    INNER JOIN users u ON u.id = p.author_id
    WHERE p.deleted_at IS NULL
      AND (
        p.visibility = 'public'
        OR p.author_id = $1
      )
      AND (
        $2::timestamptz IS NULL
        OR p.created_at < $2::timestamptz
        OR (p.created_at = $2::timestamptz AND p.id < $3::uuid)
      )
    ORDER BY p.created_at DESC, p.id DESC
    LIMIT $4
  `;

  const values = [userId, cursorCreatedAt, cursorId, limit + 1];
  const result = await pool.query(query, values);

  return result.rows;
}