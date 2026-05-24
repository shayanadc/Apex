import type { IUserRepository } from '../ports/outbound/IUserRepository.js';
import type { UserView } from '../ports/inbound/UserView.js';
import type { UpdateUserCommand } from '../ports/inbound/UpdateUserCommand.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';
import { EmptyPatchError } from '../errors/EmptyPatchError.js';
import { EmailAlreadyInUseError } from '../../domain/user/errors/EmailAlreadyInUseError.js';
import { Role } from '../../domain/user/Role.js';

export class UpdateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(command: UpdateUserCommand): Promise<UserView> {
    const {
      actor,
      targetUser: { id: targetId, name, email, role },
    } = command;

    if (name === undefined && email === undefined && role === undefined) {
      throw new EmptyPatchError();
    }

    const existingUser = await this.userRepository.findById(targetId);

    if (existingUser === null) {
      throw new UserNotFoundError(targetId);
    }

    actor.assertCanUpdate(existingUser);

    if (role !== undefined) {
      actor.assertCanUpdateRole(existingUser);
    }

    if (email !== undefined) {
      const existing = await this.userRepository.findByEmail(email);
      if (existing !== null && existing.getId() !== targetId) {
        throw new EmailAlreadyInUseError(email);
      }
    }

    if (name !== undefined) existingUser.rename(name);
    if (email !== undefined) existingUser.changeEmail(email);
    if (role !== undefined) existingUser.changeRole(Role.from(role));

    const stored = await this.userRepository.update(existingUser);

    return {
      id: stored.getId(),
      name: stored.getName(),
      email: stored.getEmail(),
      role: stored.getRole().getValue(),
    };
  }
}
