import { HttpError } from './HttpError.js';

/**
 * Thrown when a request cannot be authenticated — missing, malformed,
 * or unrecognized bearer token.
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message);
  }
}
