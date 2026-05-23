import type { IUserRepository } from '../ports/outbound/IUserRepository.js';
import type { UserView } from '../ports/inbound/UserView.js';
import type { UpdateUserCommand } from '../ports/inbound/UpdateUserCommand.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';
import { EmptyPatchError } from '../errors/EmptyPatchError.js';
import { EmailAlreadyInUseError } from '../../domain/user/errors/EmailAlreadyInUseError.js';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number, command: UpdateUserCommand): Promise<UserView> {
    if (Object.keys(command).length === 0) {
      throw new EmptyPatchError();
    }

    const user = await this.userRepository.findById(id);

    if (user === null) {
      throw new UserNotFoundError(id);
    }

    if (command.email !== undefined) {
      const existing = await this.userRepository.findByEmail(command.email);
      if (existing !== null && existing.getId() !== id) {
        throw new EmailAlreadyInUseError(command.email);
      }
    }

    if (command.name !== undefined) user.rename(command.name);
    if (command.email !== undefined) user.changeEmail(command.email);
    if (command.role !== undefined && command.role !== user.getRole().getValue()) {
      if (command.role === 'ADMIN') user.promoteToAdmin();
      else user.demoteToUser();
    }

    const stored = await this.userRepository.update(user);

    return {
      id: stored.getId(),
      name: stored.getName(),
      email: stored.getEmail(),
      role: stored.getRole().getValue(),
    };
  }
}
