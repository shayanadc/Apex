import { DomainError } from '../../errors/DomainError.js';

export class EmailAlreadyInUseError extends DomainError {
  public readonly email: string;

  constructor(email: string) {
    super('EMAIL_ALREADY_IN_USE', `Email ${email} is already in use`);
    this.email = email;
  }
}
