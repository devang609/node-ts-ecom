import { logoutUser, refreshTokens } from '../services/auth.service';
import { clearAuthCookies, COOKIE_NAMES } from '../utils/cookie';
import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { setAccessTokenCookie, setRefreshTokenCookie } from '../utils/cookie';


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



export async function logout(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        await logoutUser(req.user!.id);
        clearAuthCookies(res);
        res.status(200).json({ success: true, message: 'Logged out successfully.' });
    } catch (error) {
        next(error);
    }
}





export async function refresh(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const refreshToken: string | undefined = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];
        const tokenPair = await refreshTokens(refreshToken);

        setAccessTokenCookie(res, tokenPair.accessToken);
        setRefreshTokenCookie(res, tokenPair.refreshToken);

        res.status(200).json({ success: true, message: 'Token refreshed successfully.' });
    } catch (error) {
        next(error);
    }
}