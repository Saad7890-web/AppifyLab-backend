import { AUTH_CONSTANTS } from '../../config/constants.js';
import { ApiError } from '../../utils/api-error.js';
import {
    signAccessToken,
    signRefreshToken,
    verifyRefreshToken
} from '../../utils/jwt.js';
import { comparePassword, hashPassword } from '../../utils/password.js';
import { hashToken } from '../../utils/token-hash.js';
import {
    createRefreshToken,
    createUser,
    findRefreshTokenByHash,
    findUserByEmail,
    findUserById,
    revokeRefreshTokenByHash
} from './auth.repository.js';

function sanitizeUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    email: user.email,
    avatarUrl: user.avatar_url,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at
  };
}

function buildTokenPayload(user) {
  return {
    sub: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name
  };
}

function buildRefreshExpiresAt() {
  return new Date(Date.now() + AUTH_CONSTANTS.REFRESH_COOKIE_MAX_AGE_MS);
}

async function issueTokenPair(user, req) {
  const accessToken = signAccessToken(buildTokenPayload(user));
  const refreshToken = signRefreshToken({ sub: user.id });

  await createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    expiresAt: buildRefreshExpiresAt(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || null
  });

  return { accessToken, refreshToken };
}

export async function registerUser(input, req) {
  const existingUser = await findUserByEmail(input.email);
  if (existingUser) {
    throw new ApiError(409, 'Email already exists');
  }

  const passwordHash = await hashPassword(input.password);

  const user = await createUser({
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    passwordHash
  });

  const tokens = await issueTokenPair(user, req);

  return {
    user: sanitizeUser(user),
    ...tokens
  };
}

export async function loginUser(input, req) {
  const user = await findUserByEmail(input.email);

  if (!user || !user.is_active) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isPasswordValid = await comparePassword(input.password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const tokens = await issueTokenPair(user, req);

  return {
    user: sanitizeUser(user),
    ...tokens
  };
}

export async function refreshAuthSession(refreshToken) {
  if (!refreshToken) {
    throw new ApiError(401, 'Refresh token is missing');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(401, 'Invalid refresh token');
  }

  const tokenHash = hashToken(refreshToken);
  const storedToken = await findRefreshTokenByHash(tokenHash);

  if (!storedToken) {
    throw new ApiError(401, 'Refresh token is expired or revoked');
  }

  const user = await findUserById(decoded.sub);
  if (!user || !user.is_active) {
    throw new ApiError(401, 'User not found or inactive');
  }

  await revokeRefreshTokenByHash(tokenHash);

  const newAccessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name
  });

  const newRefreshToken = signRefreshToken({ sub: user.id });

  await createRefreshToken({
    userId: user.id,
    tokenHash: hashToken(newRefreshToken),
    expiresAt: buildRefreshExpiresAt()
  });

  return {
    user: sanitizeUser(user),
    accessToken: newAccessToken,
    refreshToken: newRefreshToken
  };
}

export async function logoutUser(refreshToken) {
  if (refreshToken) {
    await revokeRefreshTokenByHash(hashToken(refreshToken));
  }
}