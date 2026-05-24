import { InvalidUserError } from './errors/InvalidUserError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class Email {
  private constructor(private readonly value: string) {}

  static create(raw: string): Email {
    const normalized = raw?.trim().toLowerCase() ?? '';
    if (!EMAIL_PATTERN.test(normalized)) {
      throw new InvalidUserError('User email is invalid');
    }
    return new Email(normalized);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Email): boolean {
    return this.value === other.value;
  }
}
