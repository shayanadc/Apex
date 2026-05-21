import { AppError } from '../../../application/errors/AppError.js';

/**
 * Domain error: an operation would leave the User aggregate in a state
 * that violates one of its invariants (id, name, email, role, password).
 */
export class InvalidUserError extends AppError {
  constructor(message: string) {
    super('INVALID_USER', message);
  }
}
