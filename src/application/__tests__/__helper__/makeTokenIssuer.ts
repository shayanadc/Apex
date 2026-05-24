import { vi } from 'vitest';
import { createHash } from 'node:crypto';
import type { ITokenIssuer } from '../../ports/outbound/ITokenIssuer.js';

/**
 * Test double for `ITokenIssuer`. Uses real sha256 internally so the
 * hashes it produces are interchangeable with `Sha256TokenIssuer` and
 * with what `TestSeeder` stores — only `issue()` is faked so tests can
 * pin the plain token they expect back from a create call.
 */
export function makeFakeTokenIssuer(plain: string = 'plain-token'): ITokenIssuer {
  const hash = (value: string): string => createHash('sha256').update(value).digest('hex');
  return {
    issue: vi.fn(() => ({ plain, hash: hash(plain) })),
    hash: vi.fn(hash),
  };
}
