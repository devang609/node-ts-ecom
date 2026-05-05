import httpStatus from 'http-status';

import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/index.js';
import type { Role } from '../constants/roles.js';
import { hashPassword } from './password.service.js';
import { getUserByEmail } from './user.service.js';
import { revokeAllUserSessions } from './session.service.js';

type SortDirection = 'asc' | 'desc';

function parseSortBy(sortBy: string | undefined, allowedFields: string[], defaultField: string) {
  const fallback: [string, SortDirection] = [defaultField, 'desc'];
  if (!sortBy) return fallback;

  const [field, direction] = sortBy.split(':');
  if (!field || !direction) return fallback;
  if (!allowedFields.includes(field)) return fallback;
  if (direction !== 'asc' && direction !== 'desc') return fallback;
  return [field, direction] as const;
}

function buildPagination(params: { page: number; limit: number }) {
  const offset = (params.page - 1) * params.limit;
  return { limit: params.limit, offset };
}

function assertAdmin(actorRole: Role) {
  if (actorRole !== 'ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
  }
}

function assertNotAdminTarget(target: User) {
  if (target.role === 'ADMIN') {
    throw new ApiError(httpStatus.FORBIDDEN, 'Cannot modify admin user');
  }
}

export async function listUsers(params: {
  actorUserId: string;
  actorRole: Role;
  page: number;
  limit: number;
  sortBy?: string;
  role?: string;
  email?: string;
}): Promise<{ items: User[]; page: number; limit: number; total: number }> {
  assertAdmin(params.actorRole);

  const where: Record<string, unknown> = {};
  if (params.role) where.role = params.role;
  if (params.email) where.email = params.email;

  const [sortField, sortDirection] = parseSortBy(params.sortBy, ['createdAt', 'email', 'role'], 'createdAt');
  const { limit, offset } = buildPagination(params);

  const { rows, count } = await User.findAndCountAll({
    where,
    order: [[sortField, sortDirection]],
    limit,
    offset,
    attributes: ['id', 'email', 'role', 'validAfter', 'createdAt', 'updatedAt']
  });

  return { items: rows, page: params.page, limit: params.limit, total: count };
}

export async function getUserById(params: { actorUserId: string; actorRole: Role; userId: string }): Promise<User> {
  assertAdmin(params.actorRole);

  const user = await User.findByPk(params.userId, {
    attributes: ['id', 'email', 'role', 'validAfter', 'createdAt', 'updatedAt']
  });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  return user;
}

export async function createUser(params: {
  actorUserId: string;
  actorRole: Role;
  email: string;
  password: string;
}): Promise<User> {
  assertAdmin(params.actorRole);

  const existing = await getUserByEmail(params.email);
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const passwordHash = await hashPassword(params.password);
  const user = await User.create({
    email: params.email,
    passwordHash,
    role: 'BUYER',
    validAfter: new Date(0)
  });

  return User.findByPk(user.id, { attributes: ['id', 'email', 'role', 'validAfter', 'createdAt', 'updatedAt'] }).then(
    (reloaded) => reloaded as User
  );
}

export async function updateUser(params: {
  actorUserId: string;
  actorRole: Role;
  userId: string;
  update: Partial<{ email: string; password: string; role: 'BUYER' | 'SELLER' }>;
}): Promise<User> {
  assertAdmin(params.actorRole);

  const user = await User.findByPk(params.userId);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  assertNotAdminTarget(user);

  if (typeof params.update.email !== 'undefined' && params.update.email !== user.email) {
    const existing = await getUserByEmail(params.update.email);
    if (existing && existing.id !== user.id) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
    user.email = params.update.email;
  }

  let shouldInvalidateTokens = false;

  if (typeof params.update.password !== 'undefined') {
    user.passwordHash = await hashPassword(params.update.password);
    shouldInvalidateTokens = true;
  }

  if (typeof params.update.role !== 'undefined' && params.update.role !== user.role) {
    user.role = params.update.role;
    shouldInvalidateTokens = true;
  }

  await user.save();

  if (shouldInvalidateTokens) {
    const now = new Date();
    await User.update({ validAfter: now }, { where: { id: user.id } });
    await revokeAllUserSessions(user.id);
  }

  const reloaded = await User.findByPk(user.id, { attributes: ['id', 'email', 'role', 'validAfter', 'createdAt', 'updatedAt'] });
  return reloaded as User;
}

export async function deleteUser(params: { actorUserId: string; actorRole: Role; userId: string }): Promise<void> {
  assertAdmin(params.actorRole);

  const user = await User.findByPk(params.userId, { attributes: ['id', 'role'] });
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  assertNotAdminTarget(user);

  await User.destroy({ where: { id: user.id } });
}

