import type { User } from '../../../domain/user/User.js';

export type ListUsersCommand = {
  readonly actor: User;
};
