export const shorthands = undefined;

export async function up(pgm) {
  pgm.createExtension('pgcrypto', { ifNotExists: true });
  pgm.createExtension('citext', { ifNotExists: true });

  pgm.createType('post_visibility', ['public', 'private']);
  pgm.createType('like_target_type', ['post', 'comment']);
}

export async function down(pgm) {
  pgm.dropType('like_target_type');
  pgm.dropType('post_visibility');

  pgm.dropExtension('citext', { ifExists: true });
  pgm.dropExtension('pgcrypto', { ifExists: true });
}