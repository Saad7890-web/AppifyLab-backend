import { pool } from '../../config/db.js';

export async function createPost({
  authorId,
  content = null,
  imageUrl = null,
  imageKey = null,
  visibility = 'public'
}) {
  const query = `
    INSERT INTO posts (author_id, content, image_url, image_key, visibility)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id
  `;

  const values = [authorId, content, imageUrl, imageKey, visibility];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function findPostById(id) {
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
      p.deleted_at,
      u.first_name AS author_first_name,
      u.last_name AS author_last_name,
      u.email AS author_email,
      u.avatar_url AS author_avatar_url
    FROM posts p
    INNER JOIN users u ON u.id = p.author_id
    WHERE p.id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function updatePostById(id, updates) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (updates.content !== undefined) {
    fields.push(`content = $${idx++}`);
    values.push(updates.content);
  }

  if (updates.imageUrl !== undefined) {
    fields.push(`image_url = $${idx++}`);
    values.push(updates.imageUrl);
  }

  if (updates.imageKey !== undefined) {
    fields.push(`image_key = $${idx++}`);
    values.push(updates.imageKey);
  }

  if (updates.visibility !== undefined) {
    fields.push(`visibility = $${idx++}`);
    values.push(updates.visibility);
  }

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const query = `
    UPDATE posts
    SET ${fields.join(', ')}
    WHERE id = $${idx}
      AND deleted_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, values);
  return result.rows[0] || null;
}

export async function softDeletePostById(id) {
  const query = `
    UPDATE posts
    SET deleted_at = NOW(), updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}