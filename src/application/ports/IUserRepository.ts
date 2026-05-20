import type { User } from '../../domain/user/User.js';

export interface IUserRepository {
  findAll(): Promise<User[]>;
}
