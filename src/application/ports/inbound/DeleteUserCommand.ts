import type { User, UserId } from '../../../domain/user/User.js';

export type DeleteUserCommand = {
  readonly actor: User;
  readonly targetId: UserId;
};
