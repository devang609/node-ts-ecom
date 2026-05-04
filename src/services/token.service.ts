import crypto from 'node:crypto';

import * as jose from 'jose';

import { config } from '../config/config.js';
import { getJwtKeys } from '../config/jwt.js';
import type { Role } from '../constants/roles.js';

export type AccessTokenClaims = {
  sub: string;
  role: Role;
  iss: string;
  aud: string | string[];
  iat: number;
  exp: number;
};

export type RefreshTokenClaims = {
  sub: string;
  iat: number;
  exp: number;
  jti?: string;
};

export async function generateAccessToken(userId: string, role: Role): Promise<string> {
  const { privateKey } = await getJwtKeys();

  return new jose.SignJWT({ role })
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setSubject(userId)
    .setIssuer(config.jwtIssuer)
    .setAudience(config.jwtAudience)
    .setIssuedAt()
    .setExpirationTime(`${config.accessTokenTtlMinutes} minutes`)
    .sign(privateKey);
}

export async function generateRefreshToken(userId: string): Promise<string> {
  const { privateKey } = await getJwtKeys();

  return new jose.SignJWT({})
    .setProtectedHeader({ alg: 'RS256', typ: 'JWT' })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${config.refreshTokenTtlDays} days`)
    .setJti(crypto.randomUUID())
    .sign(privateKey);
}

export async function verifyAccessToken(token: string): Promise<AccessTokenClaims> {
  const { publicKey } = await getJwtKeys();
  const { payload } = await jose.jwtVerify(token, publicKey, {
    algorithms: ['RS256'],
    issuer: config.jwtIssuer,
    audience: config.jwtAudience
  });

  if (typeof payload.sub !== 'string') {
    throw new Error('Invalid access token: missing sub');
  }
  if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') {
    throw new Error('Invalid access token: missing iat/exp');
  }
  const role = payload.role;
  if (role !== 'BUYER' && role !== 'SELLER' && role !== 'ADMIN') {
    throw new Error('Invalid access token: missing role');
  }

  return payload as unknown as AccessTokenClaims;
}

export async function verifyRefreshToken(token: string): Promise<RefreshTokenClaims> {
  const { publicKey } = await getJwtKeys();
  const { payload } = await jose.jwtVerify(token, publicKey, {
    algorithms: ['RS256']
  });

  if (typeof payload.sub !== 'string') {
    throw new Error('Invalid refresh token: missing sub');
  }
  if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') {
    throw new Error('Invalid refresh token: missing iat/exp');
  }
  if (typeof (payload as Record<string, unknown>).role !== 'undefined') {
    throw new Error('Invalid refresh token: access token used');
  }

  return payload as unknown as RefreshTokenClaims;
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('base64url');
}
