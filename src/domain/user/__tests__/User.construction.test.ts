import { describe, it, expect } from 'vitest';
import { User, type UserState } from '../User.js';
import { Role } from '../Role.js';
import { InvalidUserError } from '../errors/InvalidUserError.js';

const validProps = (): UserState => ({
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
      expect(() => User.create(validProps())).not.toThrow();
    });

    it('normalises email to lowercase', () => {
      const user = User.create({ ...validProps(), email: 'ALICE@Example.COM' });
      expect(user.getEmail()).toBe('alice@example.com');
    });
  });

  describe('id validation', () => {
    it('throws InvalidUserError when id is 0', () => {
      expect(() => User.create({ ...validProps(), id: 0 })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when id is negative', () => {
      expect(() => User.create({ ...validProps(), id: -1 })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when id is a float', () => {
      expect(() => User.create({ ...validProps(), id: 1.5 })).toThrow(InvalidUserError);
    });
  });

  describe('name validation', () => {
    it('throws InvalidUserError when name is empty', () => {
      expect(() => User.create({ ...validProps(), name: '' })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when name is whitespace only', () => {
      expect(() => User.create({ ...validProps(), name: '   ' })).toThrow(InvalidUserError);
    });
  });

  describe('email validation', () => {
    it('throws InvalidUserError when email has no @', () => {
      expect(() => User.create({ ...validProps(), email: 'notanemail' })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when email has no domain part', () => {
      expect(() => User.create({ ...validProps(), email: 'user@' })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when email has no local part', () => {
      expect(() => User.create({ ...validProps(), email: '@example.com' })).toThrow(
        InvalidUserError,
      );
    });

    it('throws InvalidUserError when email is empty', () => {
      expect(() => User.create({ ...validProps(), email: '' })).toThrow(InvalidUserError);
    });
  });

  describe('password validation', () => {
    it('throws InvalidUserError when password is empty', () => {
      expect(() => User.create({ ...validProps(), password: '' })).toThrow(InvalidUserError);
    });

    it('throws InvalidUserError when password is whitespace only', () => {
      expect(() => User.create({ ...validProps(), password: '   ' })).toThrow(InvalidUserError);
    });
  });

  describe('reconstitute', () => {
    it('builds a User from a trusted state without re-validating', () => {
      // Pass values that would FAIL invariants if create() were used.
      const user = User.reconstitute({
        id: 9,
        name: '   raw-untrimmed   ',
        email: 'NotNormalised@Example.COM',
        password: 'hash',
        accessToken: 'tok',
        role: Role.USER,
      });
      expect(user.getId()).toBe(9);
      // Trusted store wins: no trim, no lowercase — exactly what the store had.
      expect(user.getName()).toBe('   raw-untrimmed   ');
      expect(user.getEmail()).toBe('NotNormalised@Example.COM');
    });

    it('does not throw for inputs that create() would reject', () => {
      expect(() =>
        User.reconstitute({
          id: 0, // create() would throw
          name: '',
          email: 'bad',
          password: '',
          accessToken: 'tok',
          role: Role.USER,
        }),
      ).not.toThrow();
    });
  });
});
