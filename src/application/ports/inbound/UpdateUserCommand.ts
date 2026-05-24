import type { User, UserId } from '../../../domain/user/User.js';
import type { RoleValue } from '../../../domain/user/Role.js';

type UpdatableFields = {
  readonly name?: string;
  readonly email?: string;
  readonly role?: RoleValue;
};

export type UpdateUserCommand = {
  readonly actor: User;
  readonly targetUser: { readonly id: UserId } & UpdatableFields;
};
