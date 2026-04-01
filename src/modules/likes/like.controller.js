import { sendSuccess } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { getLikeSummary, getLikers, toggleLike } from './like.service.js';

export const toggleTargetLike = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;

  const result = await toggleLike({
    userId: req.user.id,
    targetType,
    targetId
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: result.liked ? 'Liked successfully' : 'Unliked successfully',
    data: result
  });
});

export const getTargetLikeState = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;

  const result = await getLikeSummary({
    userId: req.user.id,
    targetType,
    targetId
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Like state fetched successfully',
    data: result
  });
});

export const getTargetLikers = asyncHandler(async (req, res) => {
  const { targetType, targetId } = req.params;
  const limit = Math.min(Number(req.query.limit) || 20, 50);
  const offset = Math.max(Number(req.query.offset) || 0, 0);

  const result = await getLikers({
    userId: req.user.id,
    targetType,
    targetId,
    limit,
    offset
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Likers fetched successfully',
    data: result
  });
});