import { Request, Response, NextFunction } from 'express';
import { COOKIE_NAMES } from '../utils/cookie';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models';
import { UnauthorizedError } from '../errors';

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token: string | undefined = req.cookies[COOKIE_NAMES.ACCESS_TOKEN];

    if (!token) {
      throw new UnauthorizedError('Authentication required.');
    }

    const result = verifyAccessToken(token);

    if (!result.ok) {
      throw result.reason === 'expired'
        ? new UnauthorizedError('Session expired. Please refresh your token.')
        : new UnauthorizedError('Invalid token. Please log in again.');
    }

    const { sub: userId, role, iat } = result.payload;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'role', 'validAfter'],
    });

    if (!user) {
      throw new UnauthorizedError('Account no longer exists.');
    }

    const tokenIssuedAt = new Date(iat * 1000);
    if (tokenIssuedAt < user.validAfter) {
      throw new UnauthorizedError('Session invalidated. Please log in again.');
    }

    req.user = { id: userId, role, tokenIssuedAt: iat };
    next();
  } catch (error) {
    next(error);
  }
}
