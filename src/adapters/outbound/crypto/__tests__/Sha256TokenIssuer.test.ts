import { describe, it, expect } from 'vitest';
import { createHash } from 'node:crypto';
import { Sha256TokenIssuer } from '../Sha256TokenIssuer.js';

describe('Sha256TokenIssuer', () => {
  const issuer = new Sha256TokenIssuer();

  it('issues a plain token and matching sha256 hash', () => {
    const { plain, hash } = issuer.issue();
    expect(plain).toMatch(/^[a-f0-9]+$/);
    expect(hash).toBe(createHash('sha256').update(plain).digest('hex'));
  });

  it('successive calls return different plain tokens', () => {
    const a = issuer.issue();
    const b = issuer.issue();
    expect(a.plain).not.toBe(b.plain);
    expect(a.hash).not.toBe(b.hash);
  });

  it('plain token is at least 32 bytes (64 hex chars) of entropy', () => {
    const { plain } = issuer.issue();
    expect(plain.length).toBeGreaterThanOrEqual(64);
  });
});
