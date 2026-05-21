import { ApplicationError } from './ApplicationError.js';

/**
 * Application error returned by the IUserRepository port contract when a
 * user does not exist. Persistence adapters are responsible for raising
 * it (translating any driver-level "no rows" signal into this type).
 */
export class UserNotFoundError extends ApplicationError {
  public readonly id: number;

  constructor(id: number) {
    super('USER_NOT_FOUND', `User with id ${id} not found`);
    this.id = id;
  }
}
