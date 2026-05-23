import { DomainError } from '../../errors/DomainError.js';

export class InvalidRoleError extends DomainError {
  constructor(value: string) {
    super('INVALID_ROLE', `Unknown role: "${value}"`);
  }
}
