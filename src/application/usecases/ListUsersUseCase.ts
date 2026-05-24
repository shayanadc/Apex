import type { IUserRepository } from '../ports/outbound/IUserRepository.js';
import type { UserView } from '../ports/inbound/UserView.js';
import type { ListUsersCommand } from '../ports/inbound/ListUsersCommand.js';
import { ForbiddenError } from '../../domain/user/errors/ForbiddenError.js';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: ListUsersCommand): Promise<UserView[]> {
    if (!command.actor.getRole().isAdmin()) {
      throw new ForbiddenError();
    }

    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      role: user.getRole().getValue(),
    }));
  }
}
