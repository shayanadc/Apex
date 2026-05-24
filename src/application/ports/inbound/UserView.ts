import type { UserId } from '../../../domain/user/User.js';
import type { RoleValue } from '../../../domain/user/Role.js';

export type UserView = {
  readonly id: UserId;
  readonly name: string;
  readonly email: string;
  readonly role: RoleValue;
};
