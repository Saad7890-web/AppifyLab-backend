import { pool } from '../../config/db.js';

export async function findPostById(id) {
  const query = `
    SELECT id, author_id, content, image_url, image_key, visibility, like_count, comment_count, created_at, updated_at, deleted_at
    FROM posts
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}