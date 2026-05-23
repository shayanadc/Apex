import { DomainError } from '../../errors/DomainError.js';

/**
 * Domain error: an operation would leave the User aggregate in a state
 * that violates one of its invariants (id, name, email, role, password).
 */
export class InvalidUserError extends DomainError {
  constructor(message: string) {
    super('INVALID_USER', message);
  }
}
