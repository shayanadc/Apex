import type { CreateUserUseCase } from '../../../../application/usecases/CreateUserUseCase.js';
import { BaseHttpHandler, type AuthContext } from './BaseHttpHandler.js';

export class CreateUserHandler extends BaseHttpHandler {
  constructor(private readonly useCase: CreateUserUseCase) {
    super();
  }

  protected async execute(c: AuthContext): Promise<Response> {
    const body = await c.req.json<Record<string, unknown>>();
    const data = await this.useCase.execute({
      actor: c.get('user'),
      newUser: {
        name: body.name as string,
        email: body.email as string,
        password: body.password as string,
        role: body.role as string,
      },
    });
    return this.responder.created(c, data);
  }
}
