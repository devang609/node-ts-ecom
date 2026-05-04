import bcrypt from 'bcryptjs';

// Cost factor of 12 is the current recommended minimum for bcrypt.
// Higher = slower hash = harder brute force, but adds ~300ms per login.
// Never go below 10 in production.
const SALT_ROUNDS = 12;

export async function hashPassword(plainText: string): Promise<string> {
  return bcrypt.hash(plainText, SALT_ROUNDS);
}

// Uses bcrypt's timing-safe compare — prevents timing attacks
// that could reveal whether a hash exists by measuring response time.
export async function verifyPassword(
  plainText: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainText, hashedPassword);
}