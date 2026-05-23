import { DomainError } from '../../errors/DomainError.js';

/**
 * Domain error: the uniqueness invariant on a User's email would be
 * violated. Enforcing it needs a repository lookup, but the rule itself
 * belongs to the User aggregate — hence its home in the domain layer.
 */
export class EmailAlreadyInUseError extends DomainError {
  public readonly email: string;

  constructor(email: string) {
    super('EMAIL_ALREADY_IN_USE', `Email ${email} is already in use`);
    this.email = email;
  }
}
