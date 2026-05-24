import { describe, it, expect } from 'vitest';
import { User, type UserState } from '../User.js';
import { Role } from '../Role.js';
import { Email } from '../Email.js';
import { ForbiddenError } from '../errors/ForbiddenError.js';
import { CannotDeleteSelfError } from '../errors/CannotDeleteSelfError.js';

const makeUser = (overrides: Partial<UserState> = {}): User =>
  User.create({
    id: 1,
    name: 'Alice',
    email: Email.create('alice@example.com'),
    password: 'hashed',
    accessToken: 'tok-1',
    role: Role.USER,
    ...overrides,
  });

const admin = makeUser({ id: 1, role: Role.ADMIN });
const userA = makeUser({ id: 2, role: Role.USER });
const userB = makeUser({ id: 3, role: Role.USER });

describe('User — assertCanListAll', () => {
  it('ADMIN can list all users', () => {
    expect(() => admin.assertCanListAll()).not.toThrow();
  });

  it('USER cannot list all users', () => {
    expect(() => userA.assertCanListAll()).toThrow(ForbiddenError);
  });
});

describe('User — assertCanCreateUsers', () => {
  it('ADMIN can create users', () => {
    expect(() => admin.assertCanCreateUsers()).not.toThrow();
  });

  it('USER cannot create users', () => {
    expect(() => userA.assertCanCreateUsers()).toThrow(ForbiddenError);
  });
});

describe('User — assertCanReference', () => {
  it('ADMIN can reference any id (even non-existent)', () => {
    expect(() => admin.assertCanReference(2)).not.toThrow();
    expect(() => admin.assertCanReference(99)).not.toThrow();
  });

  it('USER can reference their own id', () => {
    expect(() => userA.assertCanReference(2)).not.toThrow();
  });

  it("USER cannot reference another user's id (no existence leak)", () => {
    expect(() => userA.assertCanReference(3)).toThrow(ForbiddenError);
    expect(() => userA.assertCanReference(99)).toThrow(ForbiddenError);
  });
});

describe('User — assertCanView', () => {
  it('USER can view their own profile', () => {
    expect(() => userA.assertCanView(userA)).not.toThrow();
  });

  it("USER cannot view another user's profile", () => {
    expect(() => userA.assertCanView(userB)).toThrow(ForbiddenError);
  });

  it('ADMIN can view any user', () => {
    expect(() => admin.assertCanView(userA)).not.toThrow();
    expect(() => admin.assertCanView(userB)).not.toThrow();
  });

  it('ADMIN can view themselves', () => {
    expect(() => admin.assertCanView(admin)).not.toThrow();
  });
});

describe('User — assertCanUpdate', () => {
  it('USER can update their own profile', () => {
    expect(() => userA.assertCanUpdate(userA)).not.toThrow();
  });

  it("USER cannot update another user's profile", () => {
    expect(() => userA.assertCanUpdate(userB)).toThrow(ForbiddenError);
  });

  it('ADMIN can update any user', () => {
    expect(() => admin.assertCanUpdate(userA)).not.toThrow();
    expect(() => admin.assertCanUpdate(userB)).not.toThrow();
  });

  it('ADMIN can update themselves', () => {
    expect(() => admin.assertCanUpdate(admin)).not.toThrow();
  });
});

describe('User — assertCanUpdateRole', () => {
  it("ADMIN can update a user's role", () => {
    expect(() => admin.assertCanUpdateRole(userA)).not.toThrow();
  });

  it('ADMIN can update their own role', () => {
    expect(() => admin.assertCanUpdateRole(admin)).not.toThrow();
  });

  it('USER cannot update any role', () => {
    expect(() => userA.assertCanUpdateRole(userB)).toThrow(ForbiddenError);
  });

  it('USER cannot update their own role', () => {
    expect(() => userA.assertCanUpdateRole(userA)).toThrow(ForbiddenError);
  });
});

describe('User — assertCanDelete', () => {
  it('ADMIN can delete another user', () => {
    expect(() => admin.assertCanDelete(userA)).not.toThrow();
  });

  it('ADMIN cannot delete themselves', () => {
    expect(() => admin.assertCanDelete(admin)).toThrow(CannotDeleteSelfError);
  });

  it('USER cannot delete another user', () => {
    expect(() => userA.assertCanDelete(userB)).toThrow(ForbiddenError);
  });

  it('USER cannot delete themselves', () => {
    expect(() => userA.assertCanDelete(userA)).toThrow(CannotDeleteSelfError);
  });
});
