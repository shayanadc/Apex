import { Hono } from 'hono';
import type { Context, MiddlewareHandler, Next } from 'hono';
import type { Container } from '../../../composition/container.js';
import type { AuthVariables } from './middleware/AuthMiddleware.js';
import { JSON_API_CONTENT_TYPE } from './JsonApiMediaType.js';

type AppEnv = { Variables: AuthVariables };

/**
 * Maps every route to its handler. Routing is the only concern here —
 * error handling and middleware are plugged in from outside.
 *
 * Usage:
 *   new Router(container)
 *     .onError((err, c) => ...)
 *     .use('/api/*', someMiddleware)
 *     .build();
 */
export class Router {
  private readonly app: Hono<AppEnv>;

  constructor(private readonly container: Container) {
    this.app = new Hono<AppEnv>();
  }

  onError(handler: (err: Error, c: Context) => Response | Promise<Response>): this {
    this.app.onError(handler);
    return this;
  }

  use(path: string, handler: (c: Context, next: Next) => Promise<Response | void>): this {
    this.app.use(path, handler as MiddlewareHandler<AppEnv>);
    return this;
  }

  build(): this {
    this.registerRoutes();
    return this;
  }

  get fetch(): Hono['fetch'] {
    return this.app.fetch;
  }

  get honoApp(): Hono<AppEnv> {
    return this.app;
  }

  private registerRoutes(): void {
    this.app.get('/api/users', (c) => this.container.listUsersHandler.handle(c as Context));
    this.app.get('/api/users/:id', (c) => this.container.getUserHandler.handle(c as Context));
    this.app.patch('/api/users/:id', (c) => this.container.updateUserHandler.handle(c as Context));
    this.app.delete('/api/users/:id', (c) => this.container.deleteUserHandler.handle(c as Context));

    this.app.get('/health', (c) => {
      return c.json({ meta: { status: 'ok' } }, 200, {
        'Content-Type': JSON_API_CONTENT_TYPE,
      });
    });
  }
}
