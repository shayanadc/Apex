import type { Context } from 'hono';
import type { ListUsersUseCase } from '../../../application/ListUsersUseCase.js';
import type { UserView } from '../../../application/ports/UserView.js';

export class ListUsersHandler {
  constructor(private readonly useCase: ListUsersUseCase) {}

  async handle(c: Context): Promise<Response> {
    const data: UserView[] = await this.useCase.execute();

    return c.json({ data }, 200, {
      'Content-Type': 'application/vnd.api+json',
    });
  }
}
