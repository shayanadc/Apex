import type { Context } from 'hono';
import type { DeleteUserUseCase } from '../../../application/DeleteUserUseCase.js';
import { BaseHttpHandler } from '../BaseHttpHandler.js';

export class DeleteUserHandler extends BaseHttpHandler {
  constructor(private readonly useCase: DeleteUserUseCase) {
    super();
  }

  protected async execute(c: Context): Promise<Response> {
    const id = this.parseId(c.req.param('id'));
    await this.useCase.execute(id);
    return this.noContent(c);
  }
}
