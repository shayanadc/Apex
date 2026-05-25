import type { CreateUserUseCase } from '../../../../application/usecases/CreateUserUseCase.js';
import { z } from 'zod';
import { Role } from '../../../../domain/user/Role.js';
import { BaseHttpHandler, type AuthContext } from './BaseHttpHandler.js';

const CreateUserBody = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(4),
  role: z.enum([Role.USER.getValue(), Role.ADMIN.getValue()]),
});

export class CreateUserHandler extends BaseHttpHandler {
  constructor(private readonly useCase: CreateUserUseCase) {
    super();
  }

  protected async execute(c: AuthContext): Promise<Response> {
    const body = CreateUserBody.parse(await c.req.json());
    const data = await this.useCase.execute({
      actor: c.get('user'),
      newUser: body,
    });
    return this.responder.created(c, data);
  }
}
