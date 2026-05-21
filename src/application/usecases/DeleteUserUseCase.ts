import type { IUserRepository } from '../ports/IUserRepository.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';

export class DeleteUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number): Promise<void> {
    const user = await this.userRepository.findById(id);

    if (user === null) {
      throw new UserNotFoundError(id);
    }

    await this.userRepository.delete(id);
  }
}
