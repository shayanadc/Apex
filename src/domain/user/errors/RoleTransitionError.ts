import { AppError } from '../../../application/errors/AppError.js';

/**
 * Domain error: a role change is not valid for the User's current role
 * (e.g. promoting a user who is already an admin).
 */
export class RoleTransitionError extends AppError {
  constructor(message: string) {
    super('INVALID_ROLE_TRANSITION', message);
  }
}
