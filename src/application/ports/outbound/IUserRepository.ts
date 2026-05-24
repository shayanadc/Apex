import type { User, NewUserData, UserId } from '../../../domain/user/User.js';

/**
 * Persistence port for the User aggregate.
 */
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: UserId): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByHashedToken(hash: string): Promise<User | null>;
  save(draft: NewUserData): Promise<User>;
  /** @throws {UserNotFoundError} when no user has `user.getId()`. */
  update(user: User): Promise<User>;
  /** @throws {UserNotFoundError} when no user has `id`. */
  delete(id: UserId): Promise<void>;
}
