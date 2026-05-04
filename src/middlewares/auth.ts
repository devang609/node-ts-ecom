import httpStatus from 'http-status';

import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { verifyAccessToken } from '../services/token.service.js';
import { getUserById } from '../services/user.service.js';
import type { Role } from '../constants/roles.js';

export function auth(allowedRoles: Role[]) {
  return catchAsync(async (req, _res, next) => {
    const token = req.cookies?.access_token;
    if (typeof token !== 'string' || token.length === 0) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
    }

    let claims;
    try {
      claims = await verifyAccessToken(token);
    } catch {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
    }

    const user = await getUserById(claims.sub);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
    }

    const issuedAtMs = claims.iat * 1000;
    if (issuedAtMs < user.validAfter.getTime()) {
      throw new ApiError(httpStatus.UNAUTHORIZED, 'Authentication required');
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(claims.role)) {
      throw new ApiError(httpStatus.FORBIDDEN, 'Forbidden');
    }

    req.auth = { userId: user.id, role: claims.role };
    next();
  });
}

