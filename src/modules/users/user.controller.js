import { ApiError } from '../../utils/api-error.js';
import { sendSuccess } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { getCurrentUser, getUserProfileById } from './user.service.js';

export const me = asyncHandler(async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const user = await getCurrentUser(userId);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Current user fetched successfully',
    data: { user }
  });
});

export const getUserById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await getUserProfileById(id);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'User profile fetched successfully',
    data: { user }
  });
});