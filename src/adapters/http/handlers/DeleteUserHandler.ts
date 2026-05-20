import type { Context } from 'hono';
import type { DeleteUserUseCase } from '../../../application/DeleteUserUseCase.js';
import { ValidationError } from '../../../application/errors/ValidationError.js';
import { HttpErrorTranslator } from '../HttpErrorTranslator.js';

export class DeleteUserHandler {
  constructor(
    private readonly useCase: DeleteUserUseCase,
    private readonly errorTranslator: HttpErrorTranslator = new HttpErrorTranslator(),
  ) {}

  async handle(c: Context): Promise<Response> {
    try {
      const id = this.parseId(c.req.param('id'));
      await this.useCase.execute(id);
      return c.body(null, 204);
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
