import type { Context } from 'hono';
import type { UpdateUserUseCase } from '../../../../application/usecases/UpdateUserUseCase.js';
import { BaseHttpHandler } from '../BaseHttpHandler.js';

export class UpdateUserHandler extends BaseHttpHandler {
  constructor(private readonly useCase: UpdateUserUseCase) {
    super();
  }

  protected async execute(c: Context): Promise<Response> {
    const id = this.parseId(c.req.param('id'));
    const body = await c.req.json<Record<string, unknown>>();

    const patch: { name?: string; email?: string; role?: 'USER' | 'ADMIN' } = {};
    if ('name' in body) patch.name = body.name as string;
    if ('email' in body) patch.email = body.email as string;
    if ('role' in body) patch.role = body.role as 'USER' | 'ADMIN';

    const data = await this.useCase.execute(id, patch);
    return this.ok(c, data);
  }
}
