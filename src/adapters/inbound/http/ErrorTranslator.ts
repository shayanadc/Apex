export interface ErrorTranslator {
  translate(error: unknown): TranslatedError;
}

/**
 * The sanitized response plus the original error, so the handler can log
 * the original without the translator needing a logger or side effects.
 * An unmapped error is identified by `response.status === 500`.
 */
export type TranslatedError = {
  response: ErrorResponse;
  originalError: unknown;
};

export type HttpStatus = 401 | 404 | 422 | 500;

export const STATUS_TITLES = {
  401: 'Unauthorized',
  404: 'Not Found',
  422: 'Unprocessable Entity',
  500: 'Internal Server Error',
} as const satisfies Record<HttpStatus, string>;

export type JsonApiError = {
  [S in HttpStatus]: {
    status: `${S}`;
    title: (typeof STATUS_TITLES)[S];
    detail: string;
  };
}[HttpStatus];

export type ErrorResponse = {
  status: HttpStatus;
  body: { errors: JsonApiError[] };
};
