import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { setAccessTokenCookie, setRefreshTokenCookie } from '../utils/cookie';

// Controllers own only two things: reading req, writing res.
// All business logic lives in the service layer.

export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const tokenPair = await registerUser(email, password);

    setAccessTokenCookie(res, tokenPair.accessToken);
    setRefreshTokenCookie(res, tokenPair.refreshToken);

    res.status(201).json({ success: true, message: 'Account created successfully.' });
  } catch (error) {
    next(error);
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email, password } = req.body as { email: string; password: string };
    const tokenPair = await loginUser(email, password);

    setAccessTokenCookie(res, tokenPair.accessToken);
    setRefreshTokenCookie(res, tokenPair.refreshToken);

    res.status(200).json({ success: true, message: 'Logged in successfully.' });
  } catch (error) {
    next(error);
  }
}