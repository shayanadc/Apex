import { DomainError } from '../../errors/DomainError.js';

export class CannotDeleteSelfError extends DomainError {
  constructor() {
    super('CANNOT_DELETE_SELF', 'You cannot delete your own account');
  }
}
