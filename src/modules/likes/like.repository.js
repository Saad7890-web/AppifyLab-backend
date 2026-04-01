
export async function findLikeByUserAndTarget(client, {
  userId,
  targetType,
  targetId
}) {
  const query = `
    SELECT id
    FROM likes
    WHERE user_id = $1
      AND target_type = $2
      AND target_id = $3
    LIMIT 1
  `;

  const result = await client.query(query, [userId, targetType, targetId]);
  return result.rows[0] || null;
}

export async function insertLike(client, {
  userId,
  targetType,
  targetId
}) {
  const query = `
    INSERT INTO likes (user_id, target_type, target_id)
    VALUES ($1, $2, $3)
    ON CONFLICT (user_id, target_type, target_id) DO NOTHING
    RETURNING id
  `;

  const result = await client.query(query, [userId, targetType, targetId]);
  return result.rows[0] || null;
}

export async function deleteLike(client, {
  userId,
  targetType,
  targetId
}) {
  const query = `
    DELETE FROM likes
    WHERE user_id = $1
      AND target_type = $2
      AND target_id = $3
    RETURNING id
  `;

  const result = await client.query(query, [userId, targetType, targetId]);
  return result.rows[0] || null;
}

export async function incrementLikeCount(client, { targetType, targetId }) {
  if (targetType === 'post') {
    const result = await client.query(
      `
      UPDATE posts
      SET like_count = like_count + 1,
          updated_at = NOW()
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING like_count
      `,
      [targetId]
    );
    return result.rows[0] || null;
  }

  const result = await client.query(
    `
    UPDATE comments
    SET like_count = like_count + 1,
        updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING like_count
    `,
    [targetId]
  );
  return result.rows[0] || null;
}

export async function decrementLikeCount(client, { targetType, targetId }) {
  if (targetType === 'post') {
    const result = await client.query(
      `
      UPDATE posts
      SET like_count = GREATEST(like_count - 1, 0),
          updated_at = NOW()
      WHERE id = $1
        AND deleted_at IS NULL
      RETURNING like_count
      `,
      [targetId]
    );
    return result.rows[0] || null;
  }

  const result = await client.query(
    `
    UPDATE comments
    SET like_count = GREATEST(like_count - 1, 0),
        updated_at = NOW()
    WHERE id = $1
      AND deleted_at IS NULL
    RETURNING like_count
    `,
    [targetId]
  );
  return result.rows[0] || null;
}

export async function findPostLikeTargetById(client, postId) {
  const query = `
    SELECT id, author_id, visibility, deleted_at
    FROM posts
    WHERE id = $1
    LIMIT 1
  `;

  const result = await client.query(query, [postId]);
  return result.rows[0] || null;
}

export async function findCommentLikeTargetById(client, commentId) {
  const query = `
    SELECT
      c.id,
      c.author_id,
      c.post_id,
      c.deleted_at AS comment_deleted_at,
      p.visibility AS post_visibility,
      p.deleted_at AS post_deleted_at,
      p.author_id AS post_author_id
    FROM comments c
    INNER JOIN posts p ON p.id = c.post_id
    WHERE c.id = $1
    LIMIT 1
  `;

  const result = await client.query(query, [commentId]);
  return result.rows[0] || null;
}

export async function getLikeState(client, {
  userId,
  targetType,
  targetId
}) {
  const countQuery =
    targetType === 'post'
      ? `SELECT like_count FROM posts WHERE id = $1 AND deleted_at IS NULL LIMIT 1`
      : `SELECT like_count FROM comments WHERE id = $1 AND deleted_at IS NULL LIMIT 1`;

  const likedQuery = `
    SELECT id
    FROM likes
    WHERE user_id = $1
      AND target_type = $2
      AND target_id = $3
    LIMIT 1
  `;

  const [countResult, likedResult] = await Promise.all([
    client.query(countQuery, [targetId]),
    client.query(likedQuery, [userId, targetType, targetId])
  ]);

  return {
    likeCount: countResult.rows[0]?.like_count || 0,
    likedByMe: Boolean(likedResult.rows[0])
  };
}

export async function listLikers(client, {
  targetType,
  targetId,
  limit = 20,
  offset = 0
}) {
  const query = `
    SELECT
      u.id,
      u.first_name,
      u.last_name,
      u.avatar_url,
      l.created_at AS liked_at
    FROM likes l
    INNER JOIN users u ON u.id = l.user_id
    WHERE l.target_type = $1
      AND l.target_id = $2
    ORDER BY l.created_at DESC
    LIMIT $3 OFFSET $4
  `;

  const result = await client.query(query, [targetType, targetId, limit, offset]);
  return result.rows;
}