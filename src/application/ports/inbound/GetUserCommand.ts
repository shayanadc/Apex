import type { User, UserProps } from '../../../domain/user/User.js';

export type GetUserCommand = {
  readonly actor: User;
  readonly targetId: UserProps['id'];
};
