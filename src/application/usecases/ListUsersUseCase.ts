import type { IUserRepository } from '../ports/outbound/IUserRepository.js';
import type { UserView } from '../ports/inbound/UserView.js';
import type { ListUsersCommand } from '../ports/inbound/ListUsersCommand.js';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: ListUsersCommand): Promise<UserView[]> {
    command.actor.assertCanListAll();

    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail().getValue(),
      role: user.getRole().getValue(),
    }));
  }
}
