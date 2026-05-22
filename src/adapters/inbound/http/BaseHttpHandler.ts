import type { Context } from 'hono';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { RequestValidationError } from './RequestValidationError.js';
import { HttpErrorResponder } from './HttpErrorResponder.js';
import { JSON_API_CONTENT_TYPE } from './JsonApiMediaType.js';

/**
 *
 * It owns one thing — JSON:API response presentation: the
 * `application/vnd.api+json` media type, status codes, and the try/catch
 * boundary that hands any thrown value to the `HttpErrorResponder`.
 *
 */
export abstract class BaseHttpHandler {
  constructor(private readonly responder: HttpErrorResponder = new HttpErrorResponder()) {}

  /**
   * Public entry point. Wraps `execute()` in the error boundary so a
   * handler never writes its own try/catch.
   */
  async handle(c: Context): Promise<Response> {
    try {
      return await this.execute(c);
    } catch (error: unknown) {
      return this.responder.respond(c, error);
    }
  }

  /** Request-specific logic. Thrown errors are translated by `handle`. */
  protected abstract execute(c: Context): Promise<Response>;

  /** Parses a positive-integer route id, throwing `RequestValidationError` if invalid. */
  protected parseId(raw: string | undefined): number {
    const id = parseInt(raw ?? '', 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw new RequestValidationError('id', 'Invalid user id');
    }

    return id;
  }

  /** 200 OK with a JSON:API `{ data }` envelope. */
  protected ok(c: Context, data: unknown): Response {
    return this.jsonApi(c, { data }, 200);
  }

  /** 204 No Content — empty body, no media type. */
  protected noContent(c: Context): Response {
    return c.body(null, 204);
  }

  /** Any JSON:API response, with the media type applied. */
  protected jsonApi(c: Context, body: object, status: ContentfulStatusCode): Response {
    return c.json(body, status, { 'Content-Type': JSON_API_CONTENT_TYPE });
  }
}
