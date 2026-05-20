import { ApplicationError } from './ApplicationError.js';

export class UserNotFoundError extends ApplicationError {
  public readonly code = 'USER_NOT_FOUND' as const;
  public readonly id: number;

  constructor(id: number) {
    super(`User with id ${id} not found`);
    this.id = id;
  }
}
