import { ApiError } from '../../utils/api-error.js';
import {
    findUserById,
    findUserForPublicProfileById
} from './user.repository.js';

function mapUser(user) {
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

function mapPublicUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    firstName: user.first_name,
    lastName: user.last_name,
    avatarUrl: user.avatar_url,
    createdAt: user.created_at
  };
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return mapUser(user);
}

export async function getUserProfileById(userId) {
  const user = await findUserForPublicProfileById(userId);

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  return mapPublicUser(user);
}