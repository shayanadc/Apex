import type { IUserRepository } from './ports/IUserRepository.js';
import type { UserView } from './ports/UserView.js';

export class ListUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserView[]> {
    const users = await this.userRepository.findAll();
    return users.map((user) => ({
      id: user.getId(),
      name: user.getName(),
      email: user.getEmail(),
      role: user.getRole(),
    }));
  }
}
