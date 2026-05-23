import { DomainError } from '../../errors/DomainError.js';

export class ForbiddenError extends DomainError {
  constructor() {
    super('FORBIDDEN', 'You do not have permission to perform this action');
  }
}
