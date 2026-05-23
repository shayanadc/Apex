import { InvalidRoleError } from './errors/InvalidRoleError.js';

export class Role {
  static readonly USER = new Role('USER');
  static readonly ADMIN = new Role('ADMIN');

  private static readonly values = new Map<string, Role>([
    ['USER', Role.USER],
    ['ADMIN', Role.ADMIN],
  ]);

  private constructor(private readonly value: 'USER' | 'ADMIN') {}

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

  getValue(): 'USER' | 'ADMIN' {
    return this.value;
  }
}
