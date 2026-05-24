import { createHash } from 'node:crypto';
import { Role } from '../../../../../domain/user/Role.js';
import { Email } from '../../../../../domain/user/Email.js';
import type { NewUserData } from '../../../../../domain/user/User.js';
import type { IUserRepository } from '../../../../../application/ports/outbound/IUserRepository.js';

function sha256(plain: string): string {
  return createHash('sha256').update(plain).digest('hex');
}

export const PLAIN_TOKENS: { 1: string; 2: string; 3: string } = {
  1: 'token-1',
  2: 'token-2',
  3: 'token-3',
};

const SEED_USERS: NewUserData[] = [
  {
    name: 'John Doe',
    email: Email.create('john@example.com'),
    password: 'password1',
    role: Role.USER,
    accessToken: sha256(PLAIN_TOKENS[1]),
  },
  {
    name: 'Jane Doe',
    email: Email.create('jane@example.com'),
    password: 'password2',
    role: Role.ADMIN,
    accessToken: sha256(PLAIN_TOKENS[2]),
  },
  {
    name: 'Bob Smith',
    email: Email.create('bob@example.com'),
    password: 'password3',
    role: Role.USER,
    accessToken: sha256(PLAIN_TOKENS[3]),
  },
];

export class TestSeeder {
  constructor(private readonly repo: IUserRepository) {}

  async seed(): Promise<void> {
    await this.tearDown();
    for (const data of SEED_USERS) {
      await this.repo.save(data);
    }
  }

  async tearDown(): Promise<void> {
    const existing = await this.repo.findAll();
    for (const user of existing) {
      await this.repo.delete(user.getId());
    }
  }
}
