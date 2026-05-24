import type { Context } from 'hono';
import { HttpErrorTranslator } from './HttpErrorTranslator.js';
import { JsonApiResponder } from './JsonApiResponder.js';

/**
 * Composes the translator and the responder for the one operation they
 * both serve: turning a thrown value into an HTTP error response.
 */
export class HttpErrorBoundary {
  constructor(
    private readonly translator: HttpErrorTranslator = new HttpErrorTranslator(),
    private readonly responder: JsonApiResponder = new JsonApiResponder(),
  ) {}

  handle(c: Context, error: unknown): Response {
    const { status, detail, originalError } = this.translator.translate(error);
    if (status === 500) {
      console.error('Unhandled error at HTTP boundary:', originalError);
    }
    return this.responder.error(c, status, detail);
  }
}
