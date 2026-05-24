import type { IUserRepository } from '../../../../../application/ports/outbound/IUserRepository.js';
import { Container } from '../../../../../composition/Container.js';
import { Server } from '../../Server.js';

/**
 * Builds the full Hono application (middleware + routes) wired to the
 * provided repository. Tests are responsible for supplying and seeding
 * the repository independently.
 */
export class TestApp {
  readonly app: Server['app'];

  constructor(repo: IUserRepository) {
    this.app = new Server(new Container({ userRepository: repo })).app;
  }
}
