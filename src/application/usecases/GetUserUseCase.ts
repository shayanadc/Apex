import type { IUserRepository } from '../ports/IUserRepository.js';
import type { UserView } from '../ports/UserView.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';

export class GetUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: number): Promise<UserView> {
    const user = await this.userRepository.findById(id);

    if (user === null) {
      throw new UserNotFoundError(id);
    }

    return {
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      role: user.getRole(),
    };
  }
}
