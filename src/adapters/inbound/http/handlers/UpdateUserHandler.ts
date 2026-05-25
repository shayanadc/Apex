import type { UpdateUserUseCase } from '../../../../application/usecases/UpdateUserUseCase.js';
import { z } from 'zod';
import { Role } from '../../../../domain/user/Role.js';
import { BaseHttpHandler, type AuthContext } from './BaseHttpHandler.js';

const UpdateUserPatch = z
  .object({
    name: z.string().min(1),
    email: z.email(),
    role: z.enum([Role.USER.getValue(), Role.ADMIN.getValue()]),
  })
  .partial();

export class UpdateUserHandler extends BaseHttpHandler {
  constructor(private readonly useCase: UpdateUserUseCase) {
    super();
  }

  protected async execute(c: AuthContext): Promise<Response> {
    const targetId = this.parseId(c.req.param('id'));
    const patch = UpdateUserPatch.parse(await c.req.json());

    const data = await this.useCase.execute({
      actor: c.get('user'),
      targetUser: { id: targetId, ...patch },
    });
    return this.responder.ok(c, data);
  }
}
