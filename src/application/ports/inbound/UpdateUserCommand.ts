import type { User, UserProps } from '../../../domain/user/User.js';
import type { Role } from '../../../domain/user/Role.js';

type UpdatableFields = Partial<Pick<UserProps, 'name' | 'email'>> & {
  role?: ReturnType<Role['getValue']>;
};

export type UpdateUserCommand = {
  actor: User;
  targetUser: Pick<UserProps, 'id'> & UpdatableFields;
};
