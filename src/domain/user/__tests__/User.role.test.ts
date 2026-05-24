import { describe, it, expect } from 'vitest';
import { User, type UserProps } from '../User.js';
import { Role } from '../Role.js';
import { RoleTransitionError } from '../errors/RoleTransitionError.js';

const makeUser = (overrides: Partial<UserProps> = {}): User =>
  new User({
    id: 1,
    name: 'Alice',
    email: 'alice@example.com',
    password: 'hashed',
    accessToken: 'tok-1',
    role: Role.USER,
    ...overrides,
  });

describe('User — changeRole', () => {
  it('promotes a USER to ADMIN', () => {
    const user = makeUser({ role: Role.USER });
    user.changeRole(Role.ADMIN);
    expect(user.getRole().getValue()).toBe('ADMIN');
  });

  it('demotes an ADMIN to USER', () => {
    const user = makeUser({ role: Role.ADMIN });
    user.changeRole(Role.USER);
    expect(user.getRole().getValue()).toBe('USER');
  });

  it('is a no-op when role is already the target', () => {
    const user = makeUser({ role: Role.USER });
    expect(() => user.changeRole(Role.USER)).not.toThrow();
    expect(user.getRole().getValue()).toBe('USER');
  });

  it('is a no-op when ADMIN changes to ADMIN', () => {
    const user = makeUser({ role: Role.ADMIN });
    expect(() => user.changeRole(Role.ADMIN)).not.toThrow();
    expect(user.getRole().getValue()).toBe('ADMIN');
  });
});

describe('User — promoteToAdmin / demoteToUser (direct)', () => {
  it('throws RoleTransitionError when promoting an already-ADMIN user', () => {
    const user = makeUser({ role: Role.ADMIN });
    expect(() => user.promoteToAdmin()).toThrow(RoleTransitionError);
  });

  it('throws RoleTransitionError when demoting an already-USER user', () => {
    const user = makeUser({ role: Role.USER });
    expect(() => user.demoteToUser()).toThrow(RoleTransitionError);
  });
});
