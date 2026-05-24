import type { AppError } from '../../../../application/errors/AppError.js';
import type { DomainError } from '../../../../domain/errors/DomainError.js';
import { UserNotFoundError } from '../../../../application/errors/UserNotFoundError.js';
import { EmptyPatchError } from '../../../../application/errors/EmptyPatchError.js';
import { EmailAlreadyInUseError } from '../../../../domain/user/errors/EmailAlreadyInUseError.js';
import { ForbiddenError } from '../../../../domain/user/errors/ForbiddenError.js';
import { CannotDeleteSelfError } from '../../../../domain/user/errors/CannotDeleteSelfError.js';
import { InvalidUserError } from '../../../../domain/user/errors/InvalidUserError.js';
import { RoleTransitionError } from '../../../../domain/user/errors/RoleTransitionError.js';
import type { HttpError } from '../errors/HttpError.js';
import { RequestValidationError } from '../errors/RequestValidationError.js';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import type { ErrorTranslator, TranslatedError, HttpStatus } from './ErrorTranslator.js';

type MappableStatus = Exclude<HttpStatus, 500>;
type KnownErrorClass = new (...args: never[]) => DomainError | AppError | HttpError;

/**
 * The single place that maps an error type to an HTTP status. Returns
 * status + detail only — the response envelope is the responder's job.
 * Unmapped errors fall through to 500 so an unknown throw never leaks.
 */
export class HttpErrorTranslator implements ErrorTranslator {
  private static readonly STATUS_RULES: ReadonlyArray<readonly [KnownErrorClass, MappableStatus]> =
    [
      [UnauthorizedError, 401],
      [ForbiddenError, 403],
      [CannotDeleteSelfError, 403],
      [UserNotFoundError, 404],
      [EmailAlreadyInUseError, 422],
      [EmptyPatchError, 422],
      [InvalidUserError, 422],
      [RoleTransitionError, 422],
      [RequestValidationError, 422],
    ];

  translate(error: unknown): TranslatedError {
    for (const [ErrorType, status] of HttpErrorTranslator.STATUS_RULES) {
      if (error instanceof ErrorType) {
        return { status, detail: (error as Error).message, originalError: error };
      }
    }
    return { status: 500, detail: 'An unexpected error occurred', originalError: error };
  }
}
