import type { Context } from 'hono';
import type { GetUserUseCase } from '../../../application/usecases/GetUserUseCase.js';
import { BaseHttpHandler } from '../BaseHttpHandler.js';

export class GetUserHandler extends BaseHttpHandler {
  constructor(private readonly useCase: GetUserUseCase) {
    super();
  }

  protected async execute(c: Context): Promise<Response> {
    const id = this.parseId(c.req.param('id'));
    const data = await this.useCase.execute(id);
    return this.ok(c, data);
  }
}
