import { Hono } from 'hono';
import type { Container } from '../../../composition/container.js';

/**
 * Maps every route to its handler. Routing is the only concern here —
 * handlers are supplied pre-wired by the container.
 */
export class Router {
  private readonly app: Hono;

  constructor(private readonly container: Container) {
    this.app = new Hono();
    this.registerRoutes();
  }

  get fetch(): Hono['fetch'] {
    return this.app.fetch;
  }

  get honoApp(): Hono {
    return this.app;
  }

  private registerRoutes(): void {
    this.app.get('/api/users', (c) => this.container.listUsersHandler.handle(c));
    this.app.get('/api/users/:id', (c) => this.container.getUserHandler.handle(c));
    this.app.patch('/api/users/:id', (c) => this.container.updateUserHandler.handle(c));
    this.app.delete('/api/users/:id', (c) => this.container.deleteUserHandler.handle(c));

    this.app.get('/health', (c) => {
      return c.json({ meta: { status: 'ok' } }, 200, {
        'Content-Type': 'application/vnd.api+json',
      });
    });
  }
}
