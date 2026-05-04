import { User } from '../models';
import { UserRole } from '../types/user.types';
import { TokenPair } from '../types/jwt.types';
import { hashPassword, verifyPassword } from '../utils/password';
import { ConflictError, UnauthorizedError } from '../errors';
import { verifyRefreshToken, signTokenPair } from '../utils/jwt';
// import { COOKIE_NAMES } from '../utils/cookie';           
// import { Response } from 'express';                 
// import { clearAuthCookies } from '../utils/cookie';

export async function registerUser(
    email: string,
    password: string
): Promise<TokenPair> {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
        throw new ConflictError('An account with this email already exists.');
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
        email,
        password: hashedPassword,
        role: UserRole.BUYER,
    });

    return signTokenPair(user.id, user.role);
}





export async function loginUser(
    email: string,
    password: string
): Promise<TokenPair> {
    const user = await User.findOne({ where: { email } });

    const authError = new UnauthorizedError('Invalid email or password.');

    if (!user) throw authError;

    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) throw authError;

    return signTokenPair(user.id, user.role);
}



export async function logoutUser(userId: string): Promise<void> {
    await User.update(
        { validAfter: new Date() },
        { where: { id: userId } }
    );
}





export async function refreshTokens(
    refreshToken: string | undefined
): Promise<TokenPair> {
    if (!refreshToken) {
        throw new UnauthorizedError('No refresh token provided.');
    }

    const result = verifyRefreshToken(refreshToken);

    if (!result.ok) {
        throw result.reason === 'expired'
            ? new UnauthorizedError('Refresh token expired. Please log in again.')
            : new UnauthorizedError('Invalid refresh token. Please log in again.');
    }

    const { sub: userId, iat } = result.payload;

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

    return signTokenPair(user.id, user.role);
}