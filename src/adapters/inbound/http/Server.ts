import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import type { Container } from '../../../composition/Container.js';
import { AuthMiddleware } from './middleware/AuthMiddleware.js';
import type { AuthVariables } from './middleware/AuthMiddleware.js';
import { HttpErrorBoundary } from './presentation/HttpErrorBoundary.js';
import { JsonApiResponder } from './presentation/JsonApiResponder.js';
import { UserRouter } from './UserRouter.js';

type AppEnv = { Variables: AuthVariables };

export class Server {
  readonly app: Hono<AppEnv>;

  constructor(container: Container) {
    const errorBoundary = new HttpErrorBoundary();
    const responder = new JsonApiResponder();
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

    this.app.get('/health', (c) => responder.meta(c, { status: 'ok' }));
  }

  start(port: number): void {
    serve({ fetch: this.app.fetch, port });
  }
}
