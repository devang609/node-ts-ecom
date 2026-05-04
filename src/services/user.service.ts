import httpStatus from 'http-status';

import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/index.js';
import type { Role } from '../constants/roles.js';
import { hashPassword } from './password.service.js';

export async function getUserById(userId: string): Promise<User | null> {
  return User.findByPk(userId);
}

export async function getUserByEmail(email: string): Promise<User | null> {
  return User.findOne({ where: { email } });
}

export async function createUser(params: { email: string; password: string; role: Role }): Promise<User> {
  const existing = await getUserByEmail(params.email);
  if (existing) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
  }

  const passwordHash = await hashPassword(params.password);
  return User.create({
    email: params.email,
    passwordHash,
    role: params.role,
    validAfter: new Date(0)
  });
}

export async function setUserValidAfter(userId: string, validAfter: Date): Promise<void> {
  const [updated] = await User.update({ validAfter }, { where: { id: userId } });
  if (updated !== 1) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
}

