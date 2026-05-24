import type { ListUsersUseCase } from '../../../../application/usecases/ListUsersUseCase.js';
import type { UserView } from '../../../../application/ports/inbound/UserView.js';
import { BaseHttpHandler, type AuthContext } from './BaseHttpHandler.js';

export class ListUsersHandler extends BaseHttpHandler {
  constructor(private readonly useCase: ListUsersUseCase) {
    super();
  }

  protected async execute(c: AuthContext): Promise<Response> {
    const data: UserView[] = await this.useCase.execute({ actor: c.get('user') });
    return this.responder.ok(c, data);
  }
}
