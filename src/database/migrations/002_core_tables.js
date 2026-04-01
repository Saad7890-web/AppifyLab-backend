export const shorthands = undefined;

export async function up(pgm) {
  pgm.createTable('users', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    first_name: {
      type: 'varchar(100)',
      notNull: true
    },
    last_name: {
      type: 'varchar(100)',
      notNull: true
    },
    email: {
      type: 'citext',
      notNull: true,
      unique: true
    },
    password_hash: {
      type: 'text',
      notNull: true
    },
    avatar_url: {
      type: 'text'
    },
    is_active: {
      type: 'boolean',
      notNull: true,
      default: true
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('refresh_tokens', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    token_hash: {
      type: 'text',
      notNull: true,
      unique: true
    },
    expires_at: {
      type: 'timestamptz',
      notNull: true
    },
    revoked_at: {
      type: 'timestamptz'
    },
    ip_address: {
      type: 'inet'
    },
    user_agent: {
      type: 'text'
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.createTable('posts', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    author_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    content: {
      type: 'text'
    },
    image_url: {
      type: 'text'
    },
    image_key: {
      type: 'text'
    },
    visibility: {
      type: 'post_visibility',
      notNull: true,
      default: 'public'
    },
    like_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    comment_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    deleted_at: {
      type: 'timestamptz'
    }
  });

  pgm.addConstraint(
    'posts',
    'posts_content_or_image_check',
    'CHECK (content IS NOT NULL OR image_url IS NOT NULL)'
  );

  pgm.createTable('comments', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    post_id: {
      type: 'uuid',
      notNull: true,
      references: '"posts"',
      onDelete: 'CASCADE'
    },
    author_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    parent_comment_id: {
      type: 'uuid',
      references: '"comments"',
      onDelete: 'CASCADE'
    },
    body: {
      type: 'text',
      notNull: true
    },
    like_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    reply_count: {
      type: 'integer',
      notNull: true,
      default: 0
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    },
    deleted_at: {
      type: 'timestamptz'
    }
  });

  pgm.addConstraint(
    'comments',
    'comments_body_not_blank_check',
    "CHECK (char_length(trim(body)) > 0)"
  );

  pgm.createTable('likes', {
    id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()')
    },
    user_id: {
      type: 'uuid',
      notNull: true,
      references: '"users"',
      onDelete: 'CASCADE'
    },
    target_type: {
      type: 'like_target_type',
      notNull: true
    },
    target_id: {
      type: 'uuid',
      notNull: true
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()')
    }
  });

  pgm.addConstraint(
    'likes',
    'likes_user_target_unique',
    'UNIQUE (user_id, target_type, target_id)'
  );
}

export async function down(pgm) {
  pgm.dropTable('likes');
  pgm.dropTable('comments');
  pgm.dropTable('posts');
  pgm.dropTable('refresh_tokens');
  pgm.dropTable('users');
}