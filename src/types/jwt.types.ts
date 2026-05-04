import { UserRole } from './user.types';

// The exact shape of claims we encode into each token.
// Keeping these explicit prevents accidentally leaking fields
// or reading a claim that was never written.

export interface AccessTokenPayload {
  sub: string;       // user_id
  iss: string;       // issuer  (e.g. "flipmart")
  aud: string;       // audience (e.g. "flipmart-client")
  iat: number;       // issued-at  — unix seconds, set by jsonwebtoken
  exp: number;       // expiry     — unix seconds, set by jsonwebtoken
  role: UserRole;    // custom claim — authorisation decisions read from here
}

// Intentionally skeletal — no email, no role.
// A stolen refresh token should reveal nothing about the user.
export interface RefreshTokenPayload {
  sub: string;   // user_id
  iat: number;
  exp: number;
}

// What callers get back after a successful sign
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}