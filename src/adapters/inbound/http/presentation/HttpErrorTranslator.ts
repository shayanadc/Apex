import type { AppError } from '../../../../application/errors/AppError.js';
import type { DomainError } from '../../../../domain/errors/DomainError.js';
import { UserNotFoundError } from '../../../../application/errors/UserNotFoundError.js';
import { EmptyPatchError } from '../../../../application/errors/EmptyPatchError.js';
import { EmailAlreadyInUseError } from '../../../../domain/user/errors/EmailAlreadyInUseError.js';
import { ForbiddenError } from '../../../../domain/user/errors/ForbiddenError.js';
import { CannotDeleteSelfError } from '../../../../domain/user/errors/CannotDeleteSelfError.js';
import { InvalidUserError } from '../../../../domain/user/errors/InvalidUserError.js';
import { InvalidRoleError } from '../../../../domain/user/errors/InvalidRoleError.js';
import { RoleTransitionError } from '../../../../domain/user/errors/RoleTransitionError.js';
import type { HttpError } from '../errors/HttpError.js';
import { RequestValidationError } from '../errors/RequestValidationError.js';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';
import { ZodError } from 'zod';

export type HttpStatus = 401 | 403 | 404 | 422 | 500;

export type TranslatedError = {
  readonly status: HttpStatus;
  readonly detail: string;
  readonly originalError: unknown;
};

export const STATUS_TITLES = {
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
} as const satisfies Record<HttpStatus, string>;

type MappableStatus = Exclude<HttpStatus, 500>;
type KnownErrorClass = new (...args: never[]) => DomainError | AppError | HttpError;

export class HttpErrorTranslator {
  private static readonly STATUS_RULES: ReadonlyArray<readonly [KnownErrorClass, MappableStatus]> =
    [
      [UnauthorizedError, 401],
      [ForbiddenError, 403],
      [CannotDeleteSelfError, 403],
      [UserNotFoundError, 404],
      [EmailAlreadyInUseError, 422],
      [EmptyPatchError, 422],
      [InvalidUserError, 422],
      [InvalidRoleError, 422],
      [RoleTransitionError, 422],
      [RequestValidationError, 422],
    ];

  translate(error: unknown): TranslatedError {
    if (error instanceof ZodError) {
      const detail = error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      return { status: 422, detail, originalError: error };
    }
    for (const [ErrorType, status] of HttpErrorTranslator.STATUS_RULES) {
      if (error instanceof ErrorType) {
        return { status, detail: (error as Error).message, originalError: error };
      }
    }
    return { status: 500, detail: STATUS_TITLES[500], originalError: error };
  }
}
