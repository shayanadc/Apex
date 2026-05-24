import { InvalidUserError } from './errors/InvalidUserError.js';
import { RoleTransitionError } from './errors/RoleTransitionError.js';
import { ForbiddenError } from './errors/ForbiddenError.js';
import { CannotDeleteSelfError } from './errors/CannotDeleteSelfError.js';
import { Role } from './Role.js';
import type { Email } from './Email.js';

export type UserId = number;

export type UserState = {
  id: UserId;
  name: string;
  email: Email;
  password: string;
  accessToken: string;
  role: Role;
};

export type NewUserData = Omit<UserState, 'id'>;

export class User {
  private readonly id: UserId;
  private name: string;
  private email: Email;
  private accessToken: string;
  private password: string;
  private role: Role;

  private constructor(state: UserState) {
    this.id = state.id;
    this.name = state.name;
    this.email = state.email;
    this.password = state.password;
    this.accessToken = state.accessToken;
    this.role = state.role;
  }

  static create(state: UserState): User {
    if (!Number.isInteger(state.id) || state.id <= 0) {
      throw new InvalidUserError('User id must be a positive integer');
    }
    if (!state.name?.trim()) {
      throw new InvalidUserError('User name is required');
    }
    if (!state.password?.trim()) {
      throw new InvalidUserError('Password hash is required');
    }
    return new User({
      ...state,
      name: state.name.trim(),
    });
  }

  static reconstitute(state: UserState): User {
    return new User(state);
  }

  getId(): UserId {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
  getEmail(): Email {
    return this.email;
  }
  getRole(): Role {
    return this.role;
  }

  matchesToken(hash: string): boolean {
    return this.accessToken === hash;
  }

  rename(name: string): void {
    const trimmed = name?.trim();
    if (!trimmed) throw new InvalidUserError('Name is required');
    if (trimmed === this.name) return;
    this.name = trimmed;
  }

  changeEmail(email: Email): void {
    if (email.equals(this.email)) return;
    this.email = email;
  }

  changeRole(newRole: Role): void {
    if (newRole.equals(this.role)) return;
    if (newRole.isAdmin()) this.promoteToAdmin();
    else this.demoteToUser();
  }

  private promoteToAdmin(): void {
    if (this.role.isAdmin()) throw new RoleTransitionError('User is already an admin');
    this.role = Role.ADMIN;
  }

  private demoteToUser(): void {
    if (!this.role.isAdmin()) throw new RoleTransitionError('User is already a regular user');
    this.role = Role.USER;
  }

  assertCanListAll(): void {
    if (!this.role.isAdmin()) throw new ForbiddenError();
  }

  assertCanCreateUsers(): void {
    if (!this.role.isAdmin()) throw new ForbiddenError();
  }

  assertCanReference(targetId: UserId): void {
    if (this.role.isAdmin() || this.id === targetId) return;
    throw new ForbiddenError();
  }

  assertCanView(target: User): void {
    if (this.role.isAdmin() || this.id === target.id) return;
    throw new ForbiddenError();
  }

  assertCanUpdate(target: User): void {
    if (this.role.isAdmin() || this.id === target.id) return;
    throw new ForbiddenError();
  }

  assertCanUpdateRole(_target: User): void {
    if (!this.role.isAdmin()) throw new ForbiddenError();
  }

  assertCanDelete(target: User): void {
    if (this.id === target.id) throw new CannotDeleteSelfError();
    if (!this.role.isAdmin()) throw new ForbiddenError();
  }

  toState(): UserState {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      password: this.password,
      accessToken: this.accessToken,
      role: this.role,
    };
  }
}
