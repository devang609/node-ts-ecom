import fs from 'node:fs/promises';

import * as jose from 'jose';

import { config } from './config.js';

let cachedKeys: { privateKey: jose.CryptoKey; publicKey: jose.CryptoKey } | undefined;

export async function getJwtKeys(): Promise<{ privateKey: jose.CryptoKey; publicKey: jose.CryptoKey }> {
  if (cachedKeys) {
    return cachedKeys;
  }

  if (config.env === 'test') {
    const { privateKey, publicKey } = await jose.generateKeyPair('RS256');
    cachedKeys = { privateKey, publicKey };
    return cachedKeys;
  }

  if (!config.jwtPrivateKeyPath || !config.jwtPublicKeyPath) {
    throw new Error('JWT key paths are required');
  }

  const [privatePem, publicPem] = await Promise.all([
    fs.readFile(config.jwtPrivateKeyPath, 'utf8'),
    fs.readFile(config.jwtPublicKeyPath, 'utf8')
  ]);

  const [privateKey, publicKey] = await Promise.all([
    jose.importPKCS8(privatePem, 'RS256'),
    jose.importSPKI(publicPem, 'RS256')
  ]);

  cachedKeys = { privateKey, publicKey };
  return cachedKeys;
}
