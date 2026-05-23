import { InvalidUserError } from './errors/InvalidUserError.js';
import { RoleTransitionError } from './errors/RoleTransitionError.js';
import { ForbiddenError } from './errors/ForbiddenError.js';
import { CannotDeleteSelfError } from './errors/CannotDeleteSelfError.js';
import { Role } from './Role.js';

export type UserProps = {
  id: number;
  name: string;
  email: string;
  password: string;
  accessToken: string;
  role: Role;
};

export class User {
  private readonly id: number;
  private name: string;
  private email: string;
  private accessToken: string;
  private password: string;
  private role: Role;

  constructor(props: UserProps) {
    if (!Number.isInteger(props.id) || props.id <= 0) {
      throw new InvalidUserError('User id must be a positive integer');
    }
    if (!props.name?.trim()) {
      throw new InvalidUserError('User name is required');
    }
    if (!isValidEmail(props.email)) {
      throw new InvalidUserError('User email is invalid');
    }
    if (!props.password?.trim()) {
      throw new InvalidUserError('Password hash is required');
    }

    this.id = props.id;
    this.name = props.name.trim();
    this.email = props.email.trim().toLowerCase();
    this.password = props.password;
    this.accessToken = props.accessToken;
    this.role = props.role;
  }

  getId(): number {
    return this.id;
  }
  getName(): string {
    return this.name;
  }
  getEmail(): string {
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

  changeEmail(email: string): void {
    const normalized = email?.trim().toLowerCase();
    if (!normalized || !isValidEmail(normalized)) throw new InvalidUserError('Invalid email');
    if (normalized === this.email) return;
    this.email = normalized;
  }

  promoteToAdmin(): void {
    if (this.role.isAdmin()) throw new RoleTransitionError('User is already an admin');
    this.role = Role.ADMIN;
  }

  demoteToUser(): void {
    if (!this.role.isAdmin()) throw new RoleTransitionError('User is already a regular user');
    this.role = Role.USER;
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
}

function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw?.trim().toLowerCase() ?? '');
}
