import type { User } from '../../../domain/user/User.js';

export type CreateUserCommand = {
  readonly actor: User;
  readonly newUser: {
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly role: string;
  };
};
