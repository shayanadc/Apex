import { AppError } from './AppError.js';

export class EmailAlreadyInUseError extends AppError {
  public readonly code = 'EMAIL_ALREADY_IN_USE' as const;
  public readonly email: string;

  constructor(email: string) {
    super(`Email ${email} is already in use`);
    this.email = email;
  }
}
