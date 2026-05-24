import type { IUserRepository } from '../../../../../application/ports/outbound/IUserRepository.js';
import type { IPasswordHasher } from '../../../../../application/ports/outbound/IPasswordHasher.js';
import type { ITokenIssuer } from '../../../../../application/ports/outbound/ITokenIssuer.js';
import { Container } from '../../../../../composition/Container.js';
import { Server } from '../../Server.js';
import { makeFakePasswordHasher } from '../../../../../application/__tests__/__helper__/makePasswordHasher.js';
import { makeFakeTokenIssuer } from '../../../../../application/__tests__/__helper__/makeTokenIssuer.js';

/**
 * Builds the full Hono application (middleware + routes) wired to the
 * provided repository. Tests are responsible for supplying and seeding
 * the repository independently.
 */
export class TestApp {
  readonly app: Server['app'];

  constructor(
    repo: IUserRepository,
    overrides: { passwordHasher?: IPasswordHasher; tokenIssuer?: ITokenIssuer } = {},
  ) {
    this.app = new Server(
      new Container({
        userRepository: repo,
        passwordHasher: overrides.passwordHasher ?? makeFakePasswordHasher(),
        tokenIssuer: overrides.tokenIssuer ?? makeFakeTokenIssuer(),
      }),
    ).app;
  }
}
