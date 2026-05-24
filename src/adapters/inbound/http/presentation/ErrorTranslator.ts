export interface ErrorTranslator {
  translate(error: unknown): TranslatedError;
}

/**
 * The classified error: an HTTP status, a sanitized detail message, and
 * the original thrown value so the boundary can log it without the
 * translator owning a logger.
 */
export type TranslatedError = {
  status: HttpStatus;
  detail: string;
  originalError: unknown;
};

export type HttpStatus = 401 | 403 | 404 | 422 | 500;

export const STATUS_TITLES = {
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
} as const satisfies Record<HttpStatus, string>;
