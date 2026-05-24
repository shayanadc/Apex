import { vi } from 'vitest';
import type { IPasswordHasher } from '../../ports/outbound/IPasswordHasher.js';

/**
 * Predictable, fast fake — prefixes input so tests can assert that
 * "hashing happened" without doing real key derivation.
 */
export function makeFakePasswordHasher(): IPasswordHasher {
  return {
    hash: vi.fn().mockImplementation((plain: string) => Promise.resolve(`hashed:${plain}`)),
    verify: vi
      .fn()
      .mockImplementation((plain: string, hash: string) =>
        Promise.resolve(hash === `hashed:${plain}`),
      ),
  };
}
