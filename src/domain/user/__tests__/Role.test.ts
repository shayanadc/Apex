import { describe, it, expect } from 'vitest';
import { Role } from '../Role.js';
import { InvalidRoleError } from '../errors/InvalidRoleError.js';

describe('Role value object', () => {
  describe('singletons', () => {
    it('Role.USER and Role.ADMIN are the same instances across calls', () => {
      expect(Role.from('USER')).toBe(Role.USER);
      expect(Role.from('ADMIN')).toBe(Role.ADMIN);
    });
  });

  describe('from()', () => {
    it('returns Role.USER for "USER"', () => {
      expect(Role.from('USER')).toBe(Role.USER);
    });

    it('returns Role.ADMIN for "ADMIN"', () => {
      expect(Role.from('ADMIN')).toBe(Role.ADMIN);
    });

    it('throws InvalidRoleError for an unknown value', () => {
      expect(() => Role.from('GOD')).toThrow(InvalidRoleError);
    });

    it('throws InvalidRoleError for an empty string', () => {
      expect(() => Role.from('')).toThrow(InvalidRoleError);
    });

    it('throws InvalidRoleError for a lowercase "user"', () => {
      expect(() => Role.from('user')).toThrow(InvalidRoleError);
    });
  });

  describe('isAdmin()', () => {
    it('returns true for ADMIN', () => {
      expect(Role.ADMIN.isAdmin()).toBe(true);
    });

    it('returns false for USER', () => {
      expect(Role.USER.isAdmin()).toBe(false);
    });
  });

  describe('equals()', () => {
    it('returns true when comparing a role to itself', () => {
      expect(Role.USER.equals(Role.USER)).toBe(true);
      expect(Role.ADMIN.equals(Role.ADMIN)).toBe(true);
    });

    it('returns false when comparing USER to ADMIN', () => {
      expect(Role.USER.equals(Role.ADMIN)).toBe(false);
    });
  });

  describe('getValue()', () => {
    it('returns "USER" for Role.USER', () => {
      expect(Role.USER.getValue()).toBe('USER');
    });

    it('returns "ADMIN" for Role.ADMIN', () => {
      expect(Role.ADMIN.getValue()).toBe('ADMIN');
    });
  });
});
