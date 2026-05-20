import { AppError } from '../../shared/errors/AppError.js';

type HttpStatus = 404 | 422 | 500;
type MappedStatus = Exclude<HttpStatus, 500>;

const STATUS_TITLES = {
  404: 'Not Found',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
} as const satisfies Record<HttpStatus, string>;

type JsonApiError = {
  status: `${HttpStatus}`;
  title: (typeof STATUS_TITLES)[HttpStatus];
  detail: string;
};

export type ErrorResponse = {
  status: HttpStatus;
  body: { errors: JsonApiError[] };
};

/**
 * Boundary translator: maps any thrown value to a sanitized JSON:API
 * error response. Stack traces, causes, and internal details are never
 * exposed — unmapped codes and non-AppError values fall through to 500.
 */
export class HttpErrorTranslator {
  private readonly codeMap: ReadonlyMap<string, MappedStatus> = new Map([
    ['USER_NOT_FOUND', 404],
    ['INVALID_INPUT', 422],
    ['EMAIL_ALREADY_IN_USE', 422],
    ['EMPTY_PATCH', 422],
  ]);

  translate(error: unknown): ErrorResponse {
    if (AppError.isAppError(error)) {
      const status = this.codeMap.get(error.code);
      if (status !== undefined) {
        return this.buildResponse(status, error.message);
      }
    }

    return this.buildResponse(500, 'An unexpected error occurred');
  }

  private buildResponse(status: HttpStatus, detail: string): ErrorResponse {
    return {
      status,
      body: {
        errors: [
          {
            status: `${status}`,
            title: STATUS_TITLES[status],
            detail,
          },
        ],
      },
    };
  }
}