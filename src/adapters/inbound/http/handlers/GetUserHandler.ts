import type { GetUserUseCase } from '../../../../application/usecases/GetUserUseCase.js';
import { BaseHttpHandler, type AuthContext } from './BaseHttpHandler.js';

export class GetUserHandler extends BaseHttpHandler {
  constructor(private readonly useCase: GetUserUseCase) {
    super();
  }

  protected async execute(c: AuthContext): Promise<Response> {
    const data = await this.useCase.execute({
      actor: c.get('user'),
      targetId: this.parseId(c.req.param('id')),
    });
    return this.responder.ok(c, data);
  }
}
