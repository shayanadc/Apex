import type { Context, Next } from 'hono';
import type { IUserRepository } from '../../../../application/ports/outbound/IUserRepository.js';
import type { ITokenIssuer } from '../../../../application/ports/outbound/ITokenIssuer.js';
import type { User } from '../../../../domain/user/User.js';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';

export type AuthVariables = { user: User };

export class AuthMiddleware {
  constructor(
    private readonly repo: IUserRepository,
    private readonly tokenIssuer: ITokenIssuer,
  ) {}

  async handle(c: Context, next: Next): Promise<Response | void> {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }
    const rawToken = authHeader.slice('Bearer '.length);

    const user = await this.repo.findByHashedToken(this.tokenIssuer.hash(rawToken));
    if (!user) throw new UnauthorizedError('Invalid or unknown token');

    c.set('user', user);
    await next();
  }
}
