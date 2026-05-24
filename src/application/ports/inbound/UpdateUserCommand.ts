import type { User, UserState, UserId } from '../../../domain/user/User.js';
import type { Role } from '../../../domain/user/Role.js';

type UpdatableFields = Partial<Readonly<Pick<UserState, 'name' | 'email'>>> & {
  readonly role?: ReturnType<Role['getValue']>;
};

export type UpdateUserCommand = {
  readonly actor: User;
  readonly targetUser: { readonly id: UserId } & UpdatableFields;
};
