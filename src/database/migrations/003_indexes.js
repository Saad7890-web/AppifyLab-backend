export const shorthands = undefined;

export async function up(pgm) {
  pgm.sql(`
    CREATE INDEX posts_public_created_at_idx
    ON posts (created_at DESC)
    WHERE visibility = 'public' AND deleted_at IS NULL;
  `);

  pgm.sql(`
    CREATE INDEX posts_author_created_at_idx
    ON posts (author_id, created_at DESC)
    WHERE deleted_at IS NULL;
  `);

  pgm.sql(`
    CREATE INDEX comments_post_created_at_idx
    ON comments (post_id, created_at ASC)
    WHERE deleted_at IS NULL;
  `);

  pgm.sql(`
    CREATE INDEX comments_parent_created_at_idx
    ON comments (parent_comment_id, created_at ASC)
    WHERE deleted_at IS NULL;
  `);

  pgm.sql(`
    CREATE INDEX comments_author_idx
    ON comments (author_id);
  `);

  pgm.sql(`
    CREATE INDEX likes_target_idx
    ON likes (target_type, target_id);
  `);

  pgm.sql(`
    CREATE INDEX refresh_tokens_user_idx
    ON refresh_tokens (user_id);
  `);
}

export async function down(pgm) {
  pgm.sql(`DROP INDEX IF EXISTS refresh_tokens_user_idx;`);
  pgm.sql(`DROP INDEX IF EXISTS likes_target_idx;`);
  pgm.sql(`DROP INDEX IF EXISTS comments_author_idx;`);
  pgm.sql(`DROP INDEX IF EXISTS comments_parent_created_at_idx;`);
  pgm.sql(`DROP INDEX IF EXISTS comments_post_created_at_idx;`);
  pgm.sql(`DROP INDEX IF EXISTS posts_author_created_at_idx;`);
  pgm.sql(`DROP INDEX IF EXISTS posts_public_created_at_idx;`);
}