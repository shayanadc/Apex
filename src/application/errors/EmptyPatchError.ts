import { ApplicationError } from './ApplicationError.js';

/**
 * Application error: an update command carried no fields. This is a
 * constraint on the use-case command shape — the User aggregate has no
 * concept of a "patch" — so it lives in the application layer.
 */
export class EmptyPatchError extends ApplicationError {
  constructor() {
    super('EMPTY_PATCH', 'At least one field must be provided to update');
  }
}
