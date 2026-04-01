import fs from 'fs/promises';
import path from 'path';
import { ApiError } from '../../utils/api-error.js';
import {
    createPost as createPostInDb,
    findPostById,
    softDeletePostById,
    updatePostById
} from './post.repository.js';

function mapPost(row) {
  if (!row) return null;

  return {
    id: row.id,
    authorId: row.author_id,
    author: {
      id: row.author_id,
      firstName: row.author_first_name,
      lastName: row.author_last_name,
      email: row.author_email,
      avatarUrl: row.author_avatar_url
    },
    content: row.content,
    imageUrl: row.image_url,
    imageKey: row.image_key,
    visibility: row.visibility,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    deletedAt: row.deleted_at
  };
}

function buildImagePayload(file) {
  if (!file) {
    return { imageUrl: null, imageKey: null };
  }

  return {
    imageUrl: `/uploads/posts/${file.filename}`,
    imageKey: file.filename
  };
}

async function removeImageIfExists(imageKey) {
  if (!imageKey) return;

  const filePath = path.join(process.cwd(), 'uploads', 'posts', imageKey);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function createNewPost(userId, input, file) {
  const content = typeof input.content === 'string' ? input.content.trim() : null;
  const visibility = input.visibility || 'public';

  if (!content && !file) {
    throw new ApiError(400, 'Post must include text or an image');
  }

  const imagePayload = buildImagePayload(file);

  const created = await createPostInDb({
    authorId: userId,
    content: content || null,
    imageUrl: imagePayload.imageUrl,
    imageKey: imagePayload.imageKey,
    visibility
  });

  const post = await findPostById(created.id);
  return mapPost(post);
}

export async function getPostByIdService(post) {
  return mapPost(post);
}

export async function updatePostService(currentPost, input, file) {
  if (!currentPost) {
    throw new ApiError(404, 'Post not found');
  }

  const nextContent =
    typeof input.content === 'string' ? input.content.trim() : undefined;
  const nextVisibility = input.visibility;
  const imagePayload = buildImagePayload(file);

  const hasContentChange = nextContent !== undefined;
  const hasVisibilityChange = nextVisibility !== undefined;
  const hasImageChange = file !== undefined;

  if (!hasContentChange && !hasVisibilityChange && !hasImageChange) {
    throw new ApiError(400, 'Nothing to update');
  }

  if (
    (hasContentChange && nextContent === '') &&
    !hasImageChange &&
    currentPost.image_url === null
  ) {
    throw new ApiError(400, 'Post must include text or an image');
  }

  const updated = await updatePostById(currentPost.id, {
    content: hasContentChange ? nextContent : undefined,
    visibility: hasVisibilityChange ? nextVisibility : undefined,
    imageUrl: hasImageChange ? imagePayload.imageUrl : undefined,
    imageKey: hasImageChange ? imagePayload.imageKey : undefined
  });

  if (!updated) {
    throw new ApiError(404, 'Post not found');
  }

  if (hasImageChange && currentPost.image_key) {
    await removeImageIfExists(currentPost.image_key);
  }

  const post = await findPostById(currentPost.id);
  return mapPost(post);
}

export async function deletePostService(currentPost) {
  if (!currentPost) {
    throw new ApiError(404, 'Post not found');
  }

  const deleted = await softDeletePostById(currentPost.id);

  if (!deleted) {
    throw new ApiError(404, 'Post not found');
  }

  if (currentPost.image_key) {
    await removeImageIfExists(currentPost.image_key);
  }

  return true;
}