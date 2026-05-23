import { createHash } from 'node:crypto';
import type { Context, Next } from 'hono';
import type { IUserRepository } from '../../../../application/ports/outbound/IUserRepository.js';
import type { User } from '../../../../domain/user/User.js';
import { UnauthorizedError } from '../errors/UnauthorizedError.js';

/**
 * The request-scoped variables this middleware guarantees on the context
 * for every route it guards. Exported so the Router can type its Hono app —
 * the declaration lives here because this is where the variable is set.
 */
export type AuthVariables = { user: User };

/**
 * Hono middleware that enforces bearer-token authentication.
 * Each private method has a single responsibility; `handle` orchestrates them.
 */
export class AuthMiddleware {
  constructor(private readonly repo: IUserRepository) {}

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

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }

  private async resolveUser(rawToken: string): Promise<User> {
    const user = await this.repo.findByHashedToken(this.hashToken(rawToken));
    if (!user) throw new UnauthorizedError('Invalid or unknown token');
    return user;
  }
}
