import type { User, NewUserData, UserId } from '../../../domain/user/User.js';
import type { Email } from '../../../domain/user/Email.js';

export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: Email): Promise<User | null>;
  findByHashedToken(hash: string): Promise<User | null>;
  save(draft: NewUserData): Promise<User>;
  /** @throws {UserNotFoundError} when no user has `user.getId()`. */
  update(user: User): Promise<User>;
  /** @throws {UserNotFoundError} when no user has `id`. */
  delete(id: UserId): Promise<void>;
}
