export const shorthands = undefined;

export async function up(pgm) {
  pgm.sql(`
    CREATE INDEX posts_feed_cursor_idx
    ON posts (created_at DESC, id DESC)
    WHERE deleted_at IS NULL;
  `);

  pgm.sql(`
    CREATE INDEX posts_visibility_cursor_idx
    ON posts (visibility, created_at DESC, id DESC)
    WHERE deleted_at IS NULL;
  `);
}

export async function down(pgm) {
  pgm.sql(`DROP INDEX IF EXISTS posts_visibility_cursor_idx;`);
  pgm.sql(`DROP INDEX IF EXISTS posts_feed_cursor_idx;`);
}