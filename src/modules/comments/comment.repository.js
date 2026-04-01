import { pool } from '../../config/db.js';

export async function findCommentById(id) {
  const query = `
    SELECT id, post_id, author_id, parent_comment_id, body, like_count, reply_count, created_at, updated_at, deleted_at
    FROM comments
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}