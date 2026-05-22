import { AppError } from '../../../application/errors/AppError.js';
import { UserNotFoundError } from '../../../application/errors/UserNotFoundError.js';
import { EmptyPatchError } from '../../../application/errors/EmptyPatchError.js';
import { EmailAlreadyInUseError } from '../../../domain/user/errors/EmailAlreadyInUseError.js';
import { InvalidUserError } from '../../../domain/user/errors/InvalidUserError.js';
import { RoleTransitionError } from '../../../domain/user/errors/RoleTransitionError.js';
import { RequestValidationError } from './RequestValidationError.js';
import { UnauthorizedError } from './UnauthorizedError.js';
import { STATUS_TITLES } from './ErrorTranslator.js';
import type {
  ErrorTranslator,
  TranslatedError,
  HttpStatus,
  ErrorResponse,
  JsonApiError,
} from './ErrorTranslator.js';

type MappableStatus = Exclude<HttpStatus, 500>;
type AppErrorClass = new (...args: never[]) => AppError;

/**
 * Boundary translator: maps a thrown value to a sanitized JSON:API error.
 *
 * The status is keyed on the concrete error type, so inner layers never
 * carry a transport-shaped classification. This adapter — which already
 * depends on those layers — owns the mapping. An unlisted error becomes a
 * generic 500.
 */
export class HttpErrorTranslator implements ErrorTranslator {
  private static readonly STATUS_RULES: ReadonlyArray<readonly [AppErrorClass, MappableStatus]> = [
    [UnauthorizedError, 401],
    [UserNotFoundError, 404],
    [EmailAlreadyInUseError, 422],
    [EmptyPatchError, 422],
    [InvalidUserError, 422],
    [RoleTransitionError, 422],
    [RequestValidationError, 422],
  ];

  translate(error: unknown): TranslatedError {
    if (AppError.isAppError(error)) {
      for (const [ErrorType, status] of HttpErrorTranslator.STATUS_RULES) {
        if (error instanceof ErrorType) {
          return {
            response: this.buildResponse(status, error.message),
            originalError: error,
          };
        }
      }
    }

    return {
      response: this.buildResponse(500, 'An unexpected error occurred'),
      originalError: error,
    };
  }

  private buildResponse(status: HttpStatus, detail: string): ErrorResponse {
    const jsonApiError = {
      status: `${status}` as const,
      title: STATUS_TITLES[status],
      detail,
    } as JsonApiError;

    return {
      status,
      body: { errors: [jsonApiError] },
    };
  }
}
