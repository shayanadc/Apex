import { ApplicationError } from './ApplicationError.js';
import type { UserId } from '../../domain/user/User.js';

export class UserNotFoundError extends ApplicationError {
  public readonly id: UserId;

  constructor(id: UserId) {
    super('USER_NOT_FOUND', `User with id ${id} not found`);
    this.id = id;
  }
}
