import type { IUserRepository } from '../ports/outbound/IUserRepository.js';
import type { UserView } from '../ports/inbound/UserView.js';
import type { GetUserCommand } from '../ports/inbound/GetUserCommand.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: GetUserCommand): Promise<UserView> {
    const targetUser = await this.userRepository.findById(command.targetId);

    if (targetUser === null) {
      command.actor.assertCanReference(command.targetId);
      throw new UserNotFoundError(command.targetId);
    }

    command.actor.assertCanView(targetUser);

    return {
      id: targetUser.getId(),
      name: targetUser.getName(),
      email: targetUser.getEmail().getValue(),
      role: targetUser.getRole().getValue(),
    };
  }
}
