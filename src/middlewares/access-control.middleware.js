import { ApiError } from '../utils/api-error.js';
import { asyncHandler } from '../utils/async-handler.js';

export function requireOwnership(fetchResource, options = {}) {
  const {
    resourceName = 'Resource',
    ownerField = 'author_id',
    paramName = 'id',
    attachTo = 'resource'
  } = options;

  return asyncHandler(async (req, _res, next) => {
    const resourceId = req.params[paramName];

    const resource = await fetchResource(resourceId);
    if (!resource) {
      throw new ApiError(404, `${resourceName} not found`);
    }

    if (String(resource[ownerField]) !== String(req.user.id)) {
      throw new ApiError(403, 'Forbidden');
    }

    req[attachTo] = resource;
    next();
  });
}

export function requirePostAccess(fetchPostById, options = {}) {
  const {
    paramName = 'id',
    attachTo = 'post'
  } = options;

  return asyncHandler(async (req, _res, next) => {
    const postId = req.params[paramName];

    const post = await fetchPostById(postId);
    if (!post || post.deleted_at) {
      throw new ApiError(404, 'Post not found');
    }

    const isOwner = String(post.author_id) === String(req.user.id);

    if (post.visibility === 'private' && !isOwner) {
      throw new ApiError(403, 'You are not allowed to access this post');
    }

    req[attachTo] = post;
    next();
  });
}