import type { User, UserProps } from '../../../domain/user/User.js';

export type DeleteUserCommand = {
  readonly actor: User;
  readonly targetId: UserProps['id'];
};
