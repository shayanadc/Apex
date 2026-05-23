import { HttpError } from './HttpError.js';

/**
 * Adapter error: a request component (route param, query, body field)
 * failed validation at the HTTP boundary, before reaching a use case.
 */
export class RequestValidationError extends HttpError {
  public readonly field: string;

  constructor(field: string, message: string) {
    super('INVALID_INPUT', message);
    this.field = field;
  }
}
