import type { Context } from 'hono';
import type { ErrorTranslator } from './ErrorTranslator.js';
import { HttpErrorTranslator } from './HttpErrorTranslator.js';
import { JSON_API_CONTENT_TYPE } from './JsonApiMediaType.js';

/**
 * thrown value → HTTP error response.
 */
export class HttpErrorResponder {
  constructor(private readonly translator: ErrorTranslator = new HttpErrorTranslator()) {}

  respond(c: Context, error: unknown): Response {
    const { response, originalError } = this.translator.translate(error);
    if (response.status === 500) {
      console.error('Unhandled error at HTTP boundary:', originalError);
    }
    return c.json(response.body, response.status, { 'Content-Type': JSON_API_CONTENT_TYPE });
  }
}
