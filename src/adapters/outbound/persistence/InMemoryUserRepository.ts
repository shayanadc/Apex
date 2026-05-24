import { User, type NewUserData } from '../../../domain/user/User.js';
import type { IUserRepository } from '../../../application/ports/outbound/IUserRepository.js';
import { UserNotFoundError } from '../../../application/errors/UserNotFoundError.js';

export class InMemoryUserRepository implements IUserRepository {
  private readonly users: User[] = [];

  findAll(): Promise<User[]> {
    return Promise.resolve([...this.users]);
  }

  findById(id: number): Promise<User | null> {
    const user = this.users.find((u) => u.getId() === id) ?? null;
    return Promise.resolve(user);
  }

  findByEmail(email: string): Promise<User | null> {
    const user = this.users.find((u) => u.getEmail() === email) ?? null;
    return Promise.resolve(user);
  }

  findByHashedToken(hash: string): Promise<User | null> {
    const user = this.users.find((u) => u.matchesToken(hash)) ?? null;
    return Promise.resolve(user);
  }

  save(draft: NewUserData): Promise<User> {
    const user = User.create({ id: this.users.length + 1, ...draft });
    this.users.push(user);
    return Promise.resolve(user);
  }

  update(user: User): Promise<User> {
    const index = this.users.findIndex((u) => u.getId() === user.getId());

    if (index === -1) {
      throw new UserNotFoundError(user.getId());
    }

    this.users[index] = user;
    return Promise.resolve(user);
  }

  delete(id: number): Promise<void> {
    const index = this.users.findIndex((u) => u.getId() === id);

    if (index === -1) {
      throw new UserNotFoundError(id);
    }

    this.users.splice(index, 1);
    return Promise.resolve();
  }
}
