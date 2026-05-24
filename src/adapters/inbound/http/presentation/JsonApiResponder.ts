import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { STATUS_TITLES } from './HttpErrorTranslator.js';
import type { HttpStatus } from './HttpErrorTranslator.js';

export const JSON_API_CONTENT_TYPE = 'application/vnd.api+json';

/**
 * The single class that knows the JSON:API response envelope.
 * Every response — success or error — is produced here, so the
 * media type and body shape live in exactly one file.
 */
export class JsonApiResponder {
  ok(c: Context, data: unknown): Response {
    return this.send(c, { data }, 200);
  }

  created(c: Context, data: unknown): Response {
    return this.send(c, { data }, 201);
  }

  noContent(c: Context): Response {
    return c.body(null, 204);
  }

  error(c: Context, status: HttpStatus, detail: string): Response {
    const body = {
      errors: [{ status: String(status), title: STATUS_TITLES[status], detail }],
    };
    return this.send(c, body, status);
  }

  private send(c: Context, body: object, status: ContentfulStatusCode): Response {
    return c.json(body, status, { 'Content-Type': JSON_API_CONTENT_TYPE });
  }
}
