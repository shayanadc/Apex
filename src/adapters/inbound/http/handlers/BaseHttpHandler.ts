import type { Context } from 'hono';
import { RequestValidationError } from '../errors/RequestValidationError.js';
import { JsonApiResponder } from '../presentation/JsonApiResponder.js';
import { HttpErrorBoundary } from '../presentation/HttpErrorBoundary.js';

/**
 * Orchestrates the one path every handler follows:
 *   try execute() ; on throw, delegate to the error boundary.
 *
 * Knows nothing about the JSON:API envelope or status codes — those
 * live in JsonApiResponder and HttpErrorTranslator respectively.
 */
export abstract class BaseHttpHandler {
  constructor(
    protected readonly responder: JsonApiResponder = new JsonApiResponder(),
    private readonly boundary: HttpErrorBoundary = new HttpErrorBoundary(),
  ) {}

  async handle(c: Context): Promise<Response> {
    try {
      return await this.execute(c);
    } catch (error: unknown) {
      return this.boundary.handle(c, error);
    }
  }

  protected abstract execute(c: Context): Promise<Response>;

  protected parseId(raw: string | undefined): number {
    const id = parseInt(raw ?? '', 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw new RequestValidationError('id', 'Invalid user id');
    }

    return id;
  }
}
