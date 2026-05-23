/**
 * Base class for every error originating in the HTTP adapter itself
 * (request validation, authentication, etc.) before any inner-layer
 * call has happened. Self-contained — has no dependency on the
 * domain or application layers.
 */
export abstract class HttpError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }

  static is(value: unknown): value is HttpError {
    return value instanceof HttpError;
  }
}
