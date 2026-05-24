import type { UserId } from '../../../domain/user/User.js';
import type { Role } from '../../../domain/user/Role.js';

export type UserView = {
  id: UserId;
  name: string;
  email: string;
  role: ReturnType<Role['getValue']>;
};
