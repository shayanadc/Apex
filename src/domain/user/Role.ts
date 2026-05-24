import { InvalidRoleError } from './errors/InvalidRoleError.js';

export type RoleValue = 'USER' | 'ADMIN';

export class Role {
  static readonly USER = new Role('USER');
  static readonly ADMIN = new Role('ADMIN');

  private static readonly values = new Map<string, Role>([
    ['USER', Role.USER],
    ['ADMIN', Role.ADMIN],
  ]);

  private constructor(private readonly value: RoleValue) {}

  static from(value: string): Role {
    const r = Role.values.get(value);
    if (!r) throw new InvalidRoleError(value);
    return r;
  }

  isAdmin(): boolean {
    return this === Role.ADMIN;
  }

  equals(other: Role): boolean {
    return this.value === other.value;
  }

  getValue(): RoleValue {
    return this.value;
  }
}
