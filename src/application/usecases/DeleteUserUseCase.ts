import type { IUserRepository } from '../ports/outbound/IUserRepository.js';
import type { DeleteUserCommand } from '../ports/inbound/DeleteUserCommand.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: DeleteUserCommand): Promise<void> {
    const targetUser = await this.userRepository.findById(command.targetId);

    if (targetUser === null) {
      command.actor.assertCanReference(command.targetId);
      throw new UserNotFoundError(command.targetId);
    }

    command.actor.assertCanDelete(targetUser);

    await this.userRepository.delete(command.targetId);
  }
}
