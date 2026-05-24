import type { User, UserState, UserId } from '../../../domain/user/User.js';
import type { Role } from '../../../domain/user/Role.js';

type UpdatableFields = Partial<Pick<UserState, 'name' | 'email'>> & {
  role?: ReturnType<Role['getValue']>;
};

export type UpdateUserCommand = {
  actor: User;
  targetUser: { id: UserId } & UpdatableFields;
};
