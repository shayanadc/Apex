import { ApplicationError } from './ApplicationError.js';

export class ValidationError extends ApplicationError {
  public readonly code = 'INVALID_INPUT' as const;
  public readonly field: string;

  constructor(field: string, message: string) {
    super(message);
    this.field = field;
  }
}
