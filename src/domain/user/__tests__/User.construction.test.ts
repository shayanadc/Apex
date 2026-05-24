import { describe, it, expect } from 'vitest';
import { User, type UserProps } from '../User.js';
import { Role } from '../Role.js';
import { InvalidUserError } from '../errors/InvalidUserError.js';

const validProps = (): UserProps => ({
  id: 1,
  name: 'Alice',
  email: 'alice@example.com',
  password: 'hashed_password',
  accessToken: 'tok-1',
  role: Role.USER,
});

describe('User — construction invariants', () => {
  describe('valid props', () => {
    it('constructs successfully with valid props', () => {
      expect(() => new User(validProps())).not.toThrow();
    });

    it('normalises email to lowercase', () => {
      const user = new User({ ...validProps(), email: 'ALICE@Example.COM' });
      expect(user.getEmail()).toBe('alice@example.com');
    });
  });

  describe('id validation', () => {
    it('throws InvalidUserError when id is 0', () => {
      expect(() => new User({ ...validProps(), id: 0 })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when id is negative', () => {
      expect(() => new User({ ...validProps(), id: -1 })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when id is a float', () => {
      expect(() => new User({ ...validProps(), id: 1.5 })).toThrow(InvalidUserError);
    });
  });

  describe('name validation', () => {
    it('throws InvalidUserError when name is empty', () => {
      expect(() => new User({ ...validProps(), name: '' })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when name is whitespace only', () => {
      expect(() => new User({ ...validProps(), name: '   ' })).toThrow(InvalidUserError);
    });
  });

  describe('email validation', () => {
    it('throws InvalidUserError when email has no @', () => {
      expect(() => new User({ ...validProps(), email: 'notanemail' })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when email has no domain part', () => {
      expect(() => new User({ ...validProps(), email: 'user@' })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when email has no local part', () => {
      expect(() => new User({ ...validProps(), email: '@example.com' })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when email is empty', () => {
      expect(() => new User({ ...validProps(), email: '' })).toThrow(InvalidUserError);
    });
  });

  describe('password validation', () => {
    it('throws InvalidUserError when password is empty', () => {
      expect(() => new User({ ...validProps(), password: '' })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when password is whitespace only', () => {
      expect(() => new User({ ...validProps(), password: '   ' })).toThrow(InvalidUserError);
    });
  });
});
