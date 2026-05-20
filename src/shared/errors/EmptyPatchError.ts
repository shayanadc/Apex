import { AppError } from './AppError.js';

export class EmptyPatchError extends AppError {
  public readonly code = 'EMPTY_PATCH' as const;

  constructor() {
    super('At least one field must be provided to update');
  }
}
