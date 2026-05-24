import type { Context } from 'hono';
import type { AuthVariables } from '../middleware/AuthMiddleware.js';
import type { UserId } from '../../../../domain/user/User.js';
import { RequestValidationError } from '../errors/RequestValidationError.js';
import { JsonApiResponder } from '../presentation/JsonApiResponder.js';
import { HttpErrorBoundary } from '../presentation/HttpErrorBoundary.js';

export type AuthContext = Context<{ Variables: AuthVariables }>;

export abstract class BaseHttpHandler {
  protected readonly responder = new JsonApiResponder();
  private readonly boundary = new HttpErrorBoundary();

  async handle(c: AuthContext): Promise<Response> {
    try {
      return await this.execute(c);
    } catch (error: unknown) {
      return this.boundary.handle(c, error);
    }
  }

  protected abstract execute(c: AuthContext): Promise<Response>;

  protected parseId(raw: string | undefined): UserId {
    const id = parseInt(raw ?? '', 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw new RequestValidationError('id', 'Invalid user id');
    }

    return id;
  }
}
