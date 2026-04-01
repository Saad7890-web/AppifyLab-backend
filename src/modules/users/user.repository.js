import { pool } from '../../config/db.js';

export async function findUserById(id) {
  const query = `
    SELECT
      id,
      first_name,
      last_name,
      email,
      avatar_url,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function findUserForPublicProfileById(id) {
  const query = `
    SELECT
      id,
      first_name,
      last_name,
      avatar_url,
      created_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}