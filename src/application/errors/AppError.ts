/**
 * Base class for every error originating in the application layer.
 * Independent of the domain layer — no shared base class with DomainError.
 * The HTTP boundary recognises domain and application errors as a caller.
 */
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public override readonly cause?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }

  static is(value: unknown): value is AppError {
    return value instanceof AppError;
  }
}
