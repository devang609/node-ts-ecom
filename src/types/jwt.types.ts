import { UserRole } from './user.types';


export interface AccessTokenPayload {
  sub: string;
  iss: string;
  aud: string;
  iat: number;
  exp: number;
  role: UserRole;
}

export interface RefreshTokenPayload {
  sub: string;
  iat: number;
  exp: number;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}