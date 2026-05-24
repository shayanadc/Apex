import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import type { IPasswordHasher } from '../../../application/ports/outbound/IPasswordHasher.js';

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

/**
 * scrypt-based password hasher. Stores the salt alongside the derived key
 * in the hash string as `<saltHex>:<keyHex>` so a single column is enough.
 */
export class ScryptPasswordHasher implements IPasswordHasher {
  async hash(plain: string): Promise<string> {
    const salt = randomBytes(SALT_LENGTH);
    const derived = await scryptAsync(plain, salt, KEY_LENGTH);
    return `${salt.toString('hex')}:${derived.toString('hex')}`;
  }

  async verify(plain: string, hash: string): Promise<boolean> {
    const [saltHex, keyHex] = hash.split(':');
    if (!saltHex || !keyHex) return false;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(keyHex, 'hex');
    const derived = await scryptAsync(plain, salt, expected.length);
    return derived.length === expected.length && timingSafeEqual(derived, expected);
  }
}
