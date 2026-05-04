import type { RequestHandler } from 'express';
import httpStatus from 'http-status';

import { catchAsync } from '../utils/catchAsync.js';
import { config } from '../config/config.js';
import { ApiError } from '../utils/ApiError.js';
import * as authService from '../services/auth.service.js';

function tokenCookieBaseOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: config.cookieSecure,
    path: '/'
  };
}

export const register: RequestHandler = catchAsync(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  await authService.register(email, password);
  const { accessToken, refreshToken, userId, role } = await authService.login(email, password);

  res.cookie('access_token', accessToken, {
    ...tokenCookieBaseOptions(),
    maxAge: config.accessTokenTtlMinutes * 60 * 1000
  });
  res.cookie('refresh_token', refreshToken, {
    ...tokenCookieBaseOptions(),
    maxAge: config.refreshTokenTtlDays * 24 * 60 * 60 * 1000
  });

  res.status(httpStatus.CREATED).json({ userId, role });
});

export const login: RequestHandler = catchAsync(async (req, res) => {
  const { email, password } = req.body as { email: string; password: string };

  const { accessToken, refreshToken, userId, role } = await authService.login(email, password);

  res.cookie('access_token', accessToken, {
    ...tokenCookieBaseOptions(),
    maxAge: config.accessTokenTtlMinutes * 60 * 1000
  });
  res.cookie('refresh_token', refreshToken, {
    ...tokenCookieBaseOptions(),
    maxAge: config.refreshTokenTtlDays * 24 * 60 * 60 * 1000
  });

  res.status(httpStatus.OK).json({ userId, role });
});

export const refresh: RequestHandler = catchAsync(async (req, res) => {
  const refreshToken = req.cookies?.refresh_token;
  if (typeof refreshToken !== 'string' || refreshToken.length === 0) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Invalid refresh token');
  }

  const { accessToken, refreshToken: newRefreshToken, userId, role } = await authService.refresh(refreshToken);

  res.cookie('access_token', accessToken, {
    ...tokenCookieBaseOptions(),
    maxAge: config.accessTokenTtlMinutes * 60 * 1000
  });
  res.cookie('refresh_token', newRefreshToken, {
    ...tokenCookieBaseOptions(),
    maxAge: config.refreshTokenTtlDays * 24 * 60 * 60 * 1000
  });

  res.status(httpStatus.OK).json({ userId, role });
});

export const logout: RequestHandler = catchAsync(async (req, res) => {
  if (!req.auth) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
  }

  await authService.logoutAll(req.auth.userId);

  res.clearCookie('access_token', tokenCookieBaseOptions());
  res.clearCookie('refresh_token', tokenCookieBaseOptions());

  res.status(httpStatus.OK).json({ ok: true });
});
