import { DomainError } from '../../errors/DomainError.js';

export class InvalidUserError extends DomainError {
  constructor(message: string) {
    super('INVALID_USER', message);
  }
}
