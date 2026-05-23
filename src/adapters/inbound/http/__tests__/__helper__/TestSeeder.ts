import { createHash } from 'node:crypto';
import { User } from '../../../../../domain/user/User.js';
import { Role } from '../../../../../domain/user/Role.js';
import type { IUserRepository } from '../../../../../application/ports/outbound/IUserRepository.js';

function sha256(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}

export const PLAIN_TOKENS: Record<number, string> = {
  1: 'token-1',
  2: 'token-2',
  3: 'token-3',
};

const SEED_USERS: User[] = [
  new User({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password1',
    role: Role.USER,
    accessToken: sha256(PLAIN_TOKENS[1]),
  }),
  new User({
    id: 2,
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'password2',
    role: Role.ADMIN,
    accessToken: sha256(PLAIN_TOKENS[2]),
  }),
  new User({
    id: 3,
    name: 'Bob Smith',
    email: 'bob@example.com',
    password: 'password3',
    role: Role.USER,
    accessToken: sha256(PLAIN_TOKENS[3]),
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
