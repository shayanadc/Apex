import type { User } from '../../../domain/user/User.js';

/**
 * Persistence port for the User aggregate.
 */
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByHashedToken(hash: string): Promise<User | null>;
  /** Persists a new user aggregate. */
  save(user: User): Promise<void>;
  /** @throws {UserNotFoundError} when no user has `user.getId()`. */
  update(user: User): Promise<User>;
  /** @throws {UserNotFoundError} when no user has `id`. */
  delete(id: number): Promise<void>;
}
