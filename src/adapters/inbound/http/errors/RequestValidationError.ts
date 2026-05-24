import { HttpError } from './HttpError.js';

export class RequestValidationError extends HttpError {
  public readonly field: string;

  constructor(field: string, message: string) {
    super('INVALID_INPUT', message);
    this.field = field;
  }
}
