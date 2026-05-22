import { AppError } from '../../../application/errors/AppError.js';

/**
 * Thrown when a request cannot be authenticated — missing, malformed,
 * or unrecognized bearer token.
 */
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message);
  }
}
