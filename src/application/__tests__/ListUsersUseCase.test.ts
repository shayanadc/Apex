import { describe, it, expect, vi } from 'vitest';
import { ListUsersUseCase } from '../usecases/ListUsersUseCase.js';
import { User } from '../../domain/user/User.js';
import { Role } from '../../domain/user/Role.js';
import { ForbiddenError } from '../../domain/user/errors/ForbiddenError.js';
import { makeMockUserRepository } from './__helper__/makeMockUserRepository.js';

const adminActor = new User({
  id: 1,
  name: 'Admin One',
  email: 'admin@example.com',
  password: 'hash1',
  role: Role.ADMIN,
  accessToken: 'tok1',
});
const userActor = new User({
  id: 2,
  name: 'User Two',
  email: 'user@example.com',
  password: 'hash2',
  role: Role.USER,
  accessToken: 'tok2',
});
const seedUsers = [adminActor, userActor];

describe('ListUsersUseCase', () => {
  it('ADMIN → returns UserView[] without sensitive fields', async () => {
    const repo = makeMockUserRepository({ findAll: vi.fn().mockResolvedValue(seedUsers) });
    const result = await new ListUsersUseCase(repo).execute({ actor: adminActor });

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({
      id: 1,
      name: 'Admin One',
      email: 'admin@example.com',
      role: 'ADMIN',
    });
    expect(result[1]).toEqual({ id: 2, name: 'User Two', email: 'user@example.com', role: 'USER' });
    result.forEach((u) => {
      expect(u).not.toHaveProperty('password');
      expect(u).not.toHaveProperty('accessToken');
    });
  });

  it('USER → ForbiddenError, findAll never called', async () => {
    const repo = makeMockUserRepository({ findAll: vi.fn() });
    await expect(new ListUsersUseCase(repo).execute({ actor: userActor })).rejects.toThrow(
      ForbiddenError,
    );
    expect(repo.findAll).not.toHaveBeenCalled();
  });
});
