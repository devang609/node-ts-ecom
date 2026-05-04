import { Response } from 'express';
import { ENV } from '../config/env';

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
} as const;

export function setAccessTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAMES.ACCESS_TOKEN, token, {
    httpOnly: true,
    secure: ENV.IS_PRODUCTION,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });
}

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(COOKIE_NAMES.REFRESH_TOKEN, token, {
    httpOnly: true,
    secure: ENV.IS_PRODUCTION,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN);
  res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN);
}