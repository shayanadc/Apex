import type { DeleteUserUseCase } from '../../../../application/usecases/DeleteUserUseCase.js';
import { BaseHttpHandler, type AuthContext } from './BaseHttpHandler.js';

export class DeleteUserHandler extends BaseHttpHandler {
  constructor(private readonly useCase: DeleteUserUseCase) {
    super();
  }

  protected async execute(c: AuthContext): Promise<Response> {
    await this.useCase.execute({
      actor: c.get('user'),
      targetId: this.parseId(c.req.param('id')),
    });
    return this.responder.noContent(c);
  }
}
