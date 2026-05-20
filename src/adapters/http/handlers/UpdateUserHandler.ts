import type { Context } from 'hono';
import type { UpdateUserUseCase } from '../../../application/UpdateUserUseCase.js';
import { ValidationError } from '../../../application/errors/ValidationError.js';
import { HttpErrorTranslator } from '../HttpErrorTranslator.js';

export class UpdateUserHandler {
  constructor(
    private readonly useCase: UpdateUserUseCase,
    private readonly errorTranslator: HttpErrorTranslator = new HttpErrorTranslator(),
  ) {}

  async handle(c: Context): Promise<Response> {
    try {
      const id = this.parseId(c.req.param('id'));
      const body = await c.req.json<Record<string, unknown>>();

      const patch: { name?: string; email?: string; role?: 'USER' | 'ADMIN' } = {};
      if ('name' in body) patch.name = body.name as string;
      if ('email' in body) patch.email = body.email as string;
      if ('role' in body) patch.role = body.role as 'USER' | 'ADMIN';

      const data = await this.useCase.execute(id, patch);
      return c.json({ data }, 200, { 'Content-Type': 'application/vnd.api+json' });
    } catch (error: unknown) {
      const { status, body } = this.errorTranslator.translate(error);
      return c.json(body, status, { 'Content-Type': 'application/vnd.api+json' });
    }
  }

  private parseId(raw: string | undefined): number {
    const id = parseInt(raw ?? '', 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw new ValidationError('id', 'Invalid user id');
    }

    return id;
  }
}
