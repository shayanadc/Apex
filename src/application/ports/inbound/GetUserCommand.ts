import type { User, UserId } from '../../../domain/user/User.js';

export type GetUserCommand = {
  readonly actor: User;
  readonly targetId: UserId;
};
