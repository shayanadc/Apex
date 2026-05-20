export type AppErrorOptions = {
  cause?: unknown;
};

export abstract class AppError extends Error {
  public abstract readonly code: string;

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message, options.cause !== undefined ? { cause: options.cause } : undefined);

    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;

    if (typeof Error.captureStackTrace === 'function') {
      Error.captureStackTrace(this, new.target);
    }
  }

  static isAppError(value: unknown): value is AppError {
    return value instanceof AppError;
  }
}
