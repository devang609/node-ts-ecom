import fs from 'node:fs/promises';
import path from 'node:path';

import * as jose from 'jose';

function getEnvOrDefault(name, defaultValue) {
  const value = process.env[name];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }
  return defaultValue;
}

async function ensureParentDir(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

const privateKeyPath = getEnvOrDefault('JWT_PRIVATE_KEY_PATH', './keys/jwt-private.pem');
const publicKeyPath = getEnvOrDefault('JWT_PUBLIC_KEY_PATH', './keys/jwt-public.pem');

const force = process.argv.includes('--force');

if (!force && ((await fileExists(privateKeyPath)) || (await fileExists(publicKeyPath)))) {
  throw new Error(
    'JWT key file already exists. Re-run with --force to overwrite existing keys (this will invalidate existing tokens).'
  );
}

await Promise.all([ensureParentDir(privateKeyPath), ensureParentDir(publicKeyPath)]);

const { privateKey, publicKey } = await jose.generateKeyPair('RS256', { extractable: true });

const [privatePem, publicPem] = await Promise.all([
  jose.exportPKCS8(privateKey),
  jose.exportSPKI(publicKey)
]);

await Promise.all([
  fs.writeFile(privateKeyPath, privatePem, { encoding: 'utf8', mode: 0o600 }),
  fs.writeFile(publicKeyPath, publicPem, { encoding: 'utf8', mode: 0o644 })
]);

process.stdout.write(`Wrote JWT private key: ${privateKeyPath}\nWrote JWT public key:  ${publicKeyPath}\n`);
