import { DomainError } from '../../errors/DomainError.js';

export class RoleTransitionError extends DomainError {
  constructor(message: string) {
    super('INVALID_ROLE_TRANSITION', message);
  }
}
