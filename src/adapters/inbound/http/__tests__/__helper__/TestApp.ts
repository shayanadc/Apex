import type { Hono } from 'hono';
import type { IUserRepository } from '../../../../../application/ports/outbound/IUserRepository.js';
import { createContainer } from '../../../../../composition/container.js';
import { Router } from '../../Router.js';

/**
 * Builds the full Hono application (middleware + routes) wired to the
 * provided repository. Tests are responsible for supplying and seeding
 * the repository independently.
 */
export class TestApp {
  readonly app: Hono;

  constructor(repo: IUserRepository) {
    const container = createContainer(repo);
    const router = new Router(container);
    this.app = router.honoApp;
  }
}
