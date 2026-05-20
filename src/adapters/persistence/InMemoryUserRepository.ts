import { User } from '../../domain/user/User.js';
import type { IUserRepository } from '../../application/ports/IUserRepository.js';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users: User[];

  constructor() {
    this.users = [
      new User({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password1',
        role: 'USER',
        accessToken: 'token-1',
      }),
      new User({
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password2',
        role: 'ADMIN',
        accessToken: 'token-2',
      }),
      new User({
        id: 3,
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'password3',
        role: 'USER',
        accessToken: 'token-3',
      }),
    ];
  }

  findAll(): Promise<User[]> {
    return Promise.resolve(this.users);
  }
}
