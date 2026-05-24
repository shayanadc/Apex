import { Hono } from 'hono';
import type { Context } from 'hono';
import { serve } from '@hono/node-server';
import type { Container } from '../../../composition/Container.js';
import { AuthMiddleware } from './middleware/AuthMiddleware.js';
import type { AuthVariables } from './middleware/AuthMiddleware.js';
import { HttpErrorBoundary } from './presentation/HttpErrorBoundary.js';
import { JSON_API_CONTENT_TYPE } from './presentation/JsonApiResponder.js';
import { UserRouter } from './UserRouter.js';

type AppEnv = { Variables: AuthVariables };

export class Server {
  readonly app: Hono<AppEnv>;

  constructor(container: Container) {
    const errorBoundary = new HttpErrorBoundary();
    const authMiddleware = new AuthMiddleware(container.userRepository, container.tokenIssuer);
    const userRouter = new UserRouter(
      container.listUsersHandler,
      container.getUserHandler,
      container.createUserHandler,
      container.updateUserHandler,
      container.deleteUserHandler,
    );

    this.app = new Hono<AppEnv>();
    this.app.onError((err, c) => errorBoundary.handle(c, err));
    this.app.use('/api/*', (c, next) => authMiddleware.handle(c, next));
    this.app.route('/api', userRouter.instance);

    this.app.get('/health', (c: Context) =>
      c.json({ meta: { status: 'ok' } }, 200, { 'Content-Type': JSON_API_CONTENT_TYPE }),
    );
  }

  start(port: number): void {
    serve({ fetch: this.app.fetch, port });
  }
}
