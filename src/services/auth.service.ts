import httpStatus from 'http-status';

import { ApiError } from '../utils/ApiError.js';
import type { Role } from '../constants/roles.js';
import { isPasswordMatch } from './password.service.js';
import { createSession, getSessionByRefreshTokenHash, revokeAllUserSessions, rotateSession } from './session.service.js';
import { createUser, getUserByEmail, getUserById, setUserValidAfter } from './user.service.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
  type RefreshTokenClaims
} from './token.service.js';

export async function register(email: string, password: string): Promise<{ userId: string; role: Role }> {
  const user = await createUser({ email, password, role: 'BUYER' });
  return { userId: user.id, role: user.role };
}

export async function login(
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; userId: string; role: Role }> {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  const matches = await isPasswordMatch(password, user.passwordHash);
  if (!matches) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Incorrect email or password');
  }

  const refreshToken = await generateRefreshToken(user.id);
  const refreshTokenHash = hashRefreshToken(refreshToken);

  await createSession({ userId: user.id, refreshTokenHash });

  const accessToken = await generateAccessToken(user.id, user.role);

  return { accessToken, refreshToken, userId: user.id, role: user.role };
}

export async function refresh(
  refreshToken: string
): Promise<{ accessToken: string; refreshToken: string; userId: string; role: Role }> {
  let claims: RefreshTokenClaims;
  try {
    claims = await verifyRefreshToken(refreshToken);
  } catch {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  const user = await getUserById(claims.sub);
  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  const issuedAtMs = claims.iat * 1000;
  const validAfterMs = user.validAfter.getTime();
  if (issuedAtMs + 999 < validAfterMs) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  const oldHash = hashRefreshToken(refreshToken);
  const session = await getSessionByRefreshTokenHash(oldHash);
  if (!session || session.userId !== user.id) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  const newRefreshToken = await generateRefreshToken(user.id);
  const newHash = hashRefreshToken(newRefreshToken);
  await rotateSession(session.id, newHash);

  const newAccessToken = await generateAccessToken(user.id, user.role);
  return { accessToken: newAccessToken, refreshToken: newRefreshToken, userId: user.id, role: user.role };
}

export async function logoutAll(userId: string): Promise<void> {
  const now = new Date();
  await setUserValidAfter(userId, now);
  await revokeAllUserSessions(userId);
}
