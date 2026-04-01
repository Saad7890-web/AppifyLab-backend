import { AUTH_CONSTANTS } from '../../config/constants.js';
import { ApiError } from '../../utils/api-error.js';
import { sendSuccess } from '../../utils/api-response.js';
import { asyncHandler } from '../../utils/async-handler.js';
import { findUserById } from './auth.repository.js';
import { loginUser, logoutUser, refreshAuthSession, registerUser } from './auth.service.js';

function setRefreshCookie(res, refreshToken) {
  res.cookie(AUTH_CONSTANTS.REFRESH_COOKIE_NAME, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
    maxAge: AUTH_CONSTANTS.REFRESH_COOKIE_MAX_AGE_MS
  });
}

function clearRefreshCookie(res) {
  res.clearCookie(AUTH_CONSTANTS.REFRESH_COOKIE_NAME, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth'
  });
}

export const register = asyncHandler(async (req, res) => {
  const result = await registerUser(req.body, req);

  setRefreshCookie(res, result.refreshToken);

  return sendSuccess(res, {
    statusCode: 201,
    message: 'User registered successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

export const login = asyncHandler(async (req, res) => {
  const result = await loginUser(req.body, req);

  setRefreshCookie(res, result.refreshToken);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Logged in successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[AUTH_CONSTANTS.REFRESH_COOKIE_NAME];
  const result = await refreshAuthSession(refreshToken);

  setRefreshCookie(res, result.refreshToken);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Session refreshed successfully',
    data: {
      user: result.user,
      accessToken: result.accessToken
    }
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.[AUTH_CONSTANTS.REFRESH_COOKIE_NAME];
  await logoutUser(refreshToken);

  clearRefreshCookie(res);

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Logged out successfully'
  });
});

export const me = asyncHandler(async (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new ApiError(401, 'Unauthorized');
  }

  const user = await findUserById(userId);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return sendSuccess(res, {
    statusCode: 200,
    message: 'Current user fetched successfully',
    data: {
      user: {
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    }
  });
});