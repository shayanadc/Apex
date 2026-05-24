import { describe, it, expect } from 'vitest';
import { ScryptPasswordHasher } from '../ScryptPasswordHasher.js';

describe('ScryptPasswordHasher', () => {
  const hasher = new ScryptPasswordHasher();

  it('hash output is not the plain password', async () => {
    const hash = await hasher.hash('secret');
    expect(hash).not.toBe('secret');
    expect(hash).toContain(':');
  });

  it('two hashes of the same password are different (salt randomness)', async () => {
    const a = await hasher.hash('secret');
    const b = await hasher.hash('secret');
    expect(a).not.toBe(b);
  });

  it('verify returns true for the matching password', async () => {
    const hash = await hasher.hash('correct horse battery staple');
    await expect(hasher.verify('correct horse battery staple', hash)).resolves.toBe(true);
  });

  it('verify returns false for a different password', async () => {
    const hash = await hasher.hash('right');
    await expect(hasher.verify('wrong', hash)).resolves.toBe(false);
  });

  it('verify returns false for a malformed hash', async () => {
    await expect(hasher.verify('whatever', 'not-a-real-hash')).resolves.toBe(false);
  });
});
