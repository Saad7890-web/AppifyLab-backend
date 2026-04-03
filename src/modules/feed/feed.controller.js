import { sendSuccess } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { fetchFeed } from './feed.service.js';

export const getFeed = asyncHandler(async (req, res) => {
  const { limit, cursor = null } = req.validatedQuery || {};

  const result = await fetchFeed({
    userId: req.user.id,
    limit,
    cursor
  });

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Feed fetched successfully',
    data: result
  });
});