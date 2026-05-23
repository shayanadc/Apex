/**
 * Base class for every error originating in the domain layer.
 * Has no dependency on any other layer — domain stays pure.
 */
export abstract class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }

  static is(value: unknown): value is DomainError {
    return value instanceof DomainError;
  }
}
