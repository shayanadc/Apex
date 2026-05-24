import type { IUserRepository } from '../ports/outbound/IUserRepository.js';
import type { UserView } from '../ports/inbound/UserView.js';
import type { GetUserCommand } from '../ports/inbound/GetUserCommand.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';
import { ForbiddenError } from '../../domain/user/errors/ForbiddenError.js';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: GetUserCommand): Promise<UserView> {
    const targetUser = await this.userRepository.findById(command.targetId);

    if (targetUser === null) {
      if (!command.actor.getRole().isAdmin() && command.actor.getId() !== command.targetId) {
        throw new ForbiddenError();
      }
      throw new UserNotFoundError(command.targetId);
    }

    command.actor.assertCanView(targetUser);

    return {
      id: targetUser.getId(),
      name: targetUser.getName(),
      email: targetUser.getEmail(),
      role: targetUser.getRole().getValue(),
    };
  }
}
