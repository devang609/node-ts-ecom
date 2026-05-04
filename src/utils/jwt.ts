import jwt, { SignOptions, JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { ENV } from '../config/env';
import { UserRole } from '../types/user.types';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  TokenPair,
} from '../types/jwt.types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildAccessTokenPayload(
  userId: string,
  role: UserRole
): Omit<AccessTokenPayload, 'iat' | 'exp'> {
  return {
    sub: userId,
    iss: ENV.JWT.ISSUER,
    aud: ENV.JWT.AUDIENCE,
    role,
  };
}

function buildRefreshTokenPayload(
  userId: string
): Omit<RefreshTokenPayload, 'iat' | 'exp'> {
  return { sub: userId };
}

// ── Sign ─────────────────────────────────────────────────────────────────────

export function signAccessToken(userId: string, role: UserRole): string {
  const payload = buildAccessTokenPayload(userId, role);

  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn: ENV.JWT.ACCESS_TOKEN_EXPIRY,
  };

  return jwt.sign(payload, ENV.JWT.PRIVATE_KEY, options);
}

export function signRefreshToken(userId: string): string {
  const payload = buildRefreshTokenPayload(userId);

  const options: SignOptions = {
    algorithm: 'RS256',
    expiresIn: ENV.JWT.REFRESH_TOKEN_EXPIRY,
  };

  return jwt.sign(payload, ENV.JWT.PRIVATE_KEY, options);
}

export function signTokenPair(userId: string, role: UserRole): TokenPair {
  return {
    accessToken: signAccessToken(userId, role),
    refreshToken: signRefreshToken(userId),
  };
}

// ── Verify ───────────────────────────────────────────────────────────────────

type VerifyResult<T> =
  | { ok: true; payload: T }
  | { ok: false; reason: 'expired' | 'invalid' };

export function verifyAccessToken(token: string): VerifyResult<AccessTokenPayload> {
  try {
    const payload = jwt.verify(token, ENV.JWT.PUBLIC_KEY, {
      algorithms: ['RS256'],
      issuer: ENV.JWT.ISSUER,
      audience: ENV.JWT.AUDIENCE,
    }) as AccessTokenPayload;

    return { ok: true, payload };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { ok: false, reason: 'expired' };
    }
    // Covers: invalid signature, malformed token, wrong algorithm, wrong iss/aud
    if (error instanceof JsonWebTokenError) {
      return { ok: false, reason: 'invalid' };
    }
    throw error; // Unexpected — let the global error handler catch it
  }
}

export function verifyRefreshToken(token: string): VerifyResult<RefreshTokenPayload> {
  try {
    const payload = jwt.verify(token, ENV.JWT.PUBLIC_KEY, {
      algorithms: ['RS256'],
      // No iss/aud check on refresh tokens — they are skeletal by design
    }) as RefreshTokenPayload;

    return { ok: true, payload };
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return { ok: false, reason: 'expired' };
    }
    if (error instanceof JsonWebTokenError) {
      return { ok: false, reason: 'invalid' };
    }
    throw error;
  }
}