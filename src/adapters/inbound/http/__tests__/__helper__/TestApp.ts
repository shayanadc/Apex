import type { IUserRepository } from '../../../../../application/ports/outbound/IUserRepository.js';
import { createContainer } from '../../../../../composition/container.js';
import { AuthMiddleware } from '../../middleware/AuthMiddleware.js';
import { HttpErrorResponder } from '../../HttpErrorResponder.js';
import { Router } from '../../Router.js';

/**
 * Builds the full Hono application (middleware + routes) wired to the
 * provided repository. Tests are responsible for supplying and seeding
 * the repository independently.
 */
export class TestApp {
  readonly app: Router['honoApp'];

  constructor(repo: IUserRepository) {
    const errorResponder = new HttpErrorResponder();

    this.app = new Router(createContainer(repo))
      .onError((err, c) => errorResponder.respond(c, err))
      .use('/api/*', (c, next) => new AuthMiddleware(repo).handle(c, next))
      .build().honoApp;
  }
}
