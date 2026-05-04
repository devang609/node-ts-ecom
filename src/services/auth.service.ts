import { User } from '../models';
import { UserRole } from '../types/user.types';
import { TokenPair } from '../types/jwt.types';
import { hashPassword, verifyPassword } from '../utils/password';
import { signTokenPair } from '../utils/jwt';
import { ConflictError, UnauthorizedError } from '../errors';

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