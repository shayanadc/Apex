import type { Context } from 'hono';
import type { ListUsersUseCase } from '../../../application/ListUsersUseCase.js';
import type { UserView } from '../../../application/ports/UserView.js';
import { BaseHttpHandler } from '../BaseHttpHandler.js';

export class ListUsersHandler extends BaseHttpHandler {
  constructor(private readonly useCase: ListUsersUseCase) {
    super();
  }

  protected async execute(c: Context): Promise<Response> {
    const data: UserView[] = await this.useCase.execute();
    return this.ok(c, data);
  }
}
