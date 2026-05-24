import type { Context, Next } from 'hono';
import type { IUserRepository } from '../../../../application/ports/outbound/IUserRepository.js';
import type { ITokenIssuer } from '../../../../application/ports/outbound/ITokenIssuer.js';
import type { User } from '../../../../domain/user/User.js';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';

/**
 * The request-scoped variables this middleware guarantees on the context
 * for every route it guards. Exported so the Router can type its Hono app —
 * the declaration lives here because this is where the variable is set.
 */
export type AuthVariables = { user: User };

/**
 * Hono middleware that enforces bearer-token authentication. Delegates
 * the actual hashing to the injected `ITokenIssuer` so the verification
 * scheme is always the same one used to mint tokens at creation time.
 */
export class AuthMiddleware {
  constructor(
    private readonly repo: IUserRepository,
    private readonly tokenIssuer: ITokenIssuer,
  ) {}

  async handle(c: Context, next: Next): Promise<Response | void> {
    const rawToken = this.extractToken(c);
    const user = await this.resolveUser(rawToken);
    c.set('user', user);
    await next();
  }

  private extractToken(c: Context): string {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header');
    }
    return authHeader.slice('Bearer '.length);
  }

  private async resolveUser(rawToken: string): Promise<User> {
    const user = await this.repo.findByHashedToken(this.tokenIssuer.hash(rawToken));
    if (!user) throw new UnauthorizedError('Invalid or unknown token');
    return user;
  }
}
