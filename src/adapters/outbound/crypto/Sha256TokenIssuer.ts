import { createHash, randomBytes } from 'node:crypto';
import type {
  ITokenIssuer,
  IssuedToken,
} from '../../../application/ports/outbound/ITokenIssuer.js';

const TOKEN_BYTES = 32;

/**
 * Generates a random bearer token and the sha256 hash that gets persisted.
 * `issue` and `hash` share the same hashing function, so a token minted
 * here can always be verified by `AuthMiddleware` via the same port.
 */
export class Sha256TokenIssuer implements ITokenIssuer {
  issue(): IssuedToken {
    const plain = randomBytes(TOKEN_BYTES).toString('hex');
    return { plain, hash: this.hash(plain) };
  }

  hash(plain: string): string {
    return createHash('sha256').update(plain).digest('hex');
  }
}
