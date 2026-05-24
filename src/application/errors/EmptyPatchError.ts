import { ApplicationError } from './ApplicationError.js';

export class EmptyPatchError extends ApplicationError {
  constructor() {
    super('EMPTY_PATCH', 'At least one field must be provided to update');
  }
}
