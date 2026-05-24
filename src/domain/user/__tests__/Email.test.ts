import { describe, it, expect } from 'vitest';
import { Email } from '../Email.js';
import { InvalidUserError } from '../errors/InvalidUserError.js';

describe('Email value object', () => {
  describe('create()', () => {
    it('accepts a well-formed address', () => {
      expect(() => Email.create('alice@example.com')).not.toThrow();
    });

    it('normalises to lowercase and trims surrounding whitespace', () => {
      const email = Email.create('  ALICE@Example.COM  ');
      expect(email.getValue()).toBe('alice@example.com');
    });

    it('throws InvalidUserError when there is no @', () => {
      expect(() => Email.create('notanemail')).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when there is no domain part', () => {
      expect(() => Email.create('user@')).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when there is no local part', () => {
      expect(() => Email.create('@example.com')).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError on an empty string', () => {
      expect(() => Email.create('')).toThrow(InvalidUserError);
    });
  });

  describe('equals()', () => {
    it('returns true for two emails with the same normalised value', () => {
      const a = Email.create('alice@example.com');
      const b = Email.create('ALICE@example.com');
      expect(a.equals(b)).toBe(true);
    });

    it('returns false for two different emails', () => {
      const a = Email.create('alice@example.com');
      const b = Email.create('bob@example.com');
      expect(a.equals(b)).toBe(false);
    });
  });
});
