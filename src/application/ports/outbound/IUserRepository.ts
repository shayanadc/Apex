import type { User } from '../../../domain/user/User.js';

/**
 * Persistence port for the User aggregate.
 *
 * Contract:
 * - Query methods (`findAll`, `findById`, `findByEmail`) treat absence as a
 *   valid result — they return an empty array or `null`, never throw.
 * - Mutation methods (`update`, `delete`) require the target to exist and
 *   raise `UserNotFoundError` when it does not. Adapters are responsible
 *   for translating any driver-level "no rows" signal into that error.
 */
export interface IUserRepository {
  findAll(): Promise<User[]>;
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  /** @throws {UserNotFoundError} when no user has `user.getId()`. */
  update(user: User): Promise<User>;
  /** @throws {UserNotFoundError} when no user has `id`. */
  delete(id: number): Promise<void>;
}
