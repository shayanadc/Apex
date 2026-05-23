import { DomainError } from '../../errors/DomainError.js';

/**
 * Domain error: a role change is not valid for the User's current role
 * (e.g. promoting a user who is already an admin).
 */
export class RoleTransitionError extends DomainError {
  constructor(message: string) {
    super('INVALID_ROLE_TRANSITION', message);
  }
}
