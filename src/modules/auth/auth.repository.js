import { pool } from '../../config/db.js';

export async function createUser({
  firstName,
  lastName,
  email,
  passwordHash
}) {
  const query = `
    INSERT INTO users (first_name, last_name, email, password_hash)
    VALUES ($1, $2, $3, $4)
    RETURNING id, first_name, last_name, email, avatar_url, is_active, created_at, updated_at
  `;

  const values = [firstName, lastName, email, passwordHash];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function findUserByEmail(email) {
  const query = `
    SELECT id, first_name, last_name, email, password_hash, avatar_url, is_active, created_at, updated_at
    FROM users
    WHERE email = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

export async function findUserById(id) {
  const query = `
    SELECT id, first_name, last_name, email, avatar_url, is_active, created_at, updated_at
    FROM users
    WHERE id = $1
    LIMIT 1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

export async function createRefreshToken({
  userId,
  tokenHash,
  expiresAt,
  ipAddress,
  userAgent
}) {
  const query = `
    INSERT INTO refresh_tokens (user_id, token_hash, expires_at, ip_address, user_agent)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, user_id, token_hash, expires_at, revoked_at, created_at
  `;

  const values = [userId, tokenHash, expiresAt, ipAddress, userAgent];
  const result = await pool.query(query, values);
  return result.rows[0];
}

export async function findRefreshTokenByHash(tokenHash) {
  const query = `
    SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
    FROM refresh_tokens
    WHERE token_hash = $1
      AND revoked_at IS NULL
      AND expires_at > NOW()
    LIMIT 1
  `;

  const result = await pool.query(query, [tokenHash]);
  return result.rows[0] || null;
}

export async function revokeRefreshTokenByHash(tokenHash) {
  const query = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE token_hash = $1
      AND revoked_at IS NULL
    RETURNING id
  `;

  const result = await pool.query(query, [tokenHash]);
  return result.rowCount > 0;
}

export async function revokeAllRefreshTokensByUserId(userId) {
  const query = `
    UPDATE refresh_tokens
    SET revoked_at = NOW()
    WHERE user_id = $1
      AND revoked_at IS NULL
  `;

  await pool.query(query, [userId]);
}