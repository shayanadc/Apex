import { User } from '../../../../../domain/user/User.js';
import type { IUserRepository } from '../../../../../application/ports/outbound/IUserRepository.js';

const SEED_USERS: User[] = [
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

/**
 * Test-only seeder. Seeds via the public `IUserRepository` port so no
 * test-specific methods are needed on production adapters.
 */
export class TestSeeder {
  constructor(private readonly repo: IUserRepository) {}

  async seed(): Promise<void> {
    await this.tearDown();
    for (const user of SEED_USERS) {
      await this.repo.save(user);
    }
  }

  async tearDown(): Promise<void> {
    for (const user of SEED_USERS) {
      try {
        await this.repo.delete(user.getId());
      } catch {
        // user may have already been deleted by the test — that is fine
      }
    }
  }
}
