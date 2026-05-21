// Base class for every error raised inside the application. Carries a
// stable, domain-specific `code`; mapping an error to a transport concern
// (e.g. an HTTP status) is the job of a boundary adapter, not this class.
export class AppError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
    this.name = new.target.name;
  }

  static isAppError(value: unknown): value is AppError {
    return value instanceof AppError;
  }
}
