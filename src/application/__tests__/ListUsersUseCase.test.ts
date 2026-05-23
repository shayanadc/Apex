import { describe, it, expect, vi } from 'vitest';
import { ListUsersUseCase } from '../usecases/ListUsersUseCase.js';
import { User } from '../../domain/user/User.js';
import { Role } from '../../domain/user/Role.js';
import { makeMockUserRepository } from './__helper__/makeMockUserRepository.js';

describe('ListUsersUseCase', () => {
  it('execute() maps User[] from repository to UserView[]', async () => {
    const seedUsers = [
      new User({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password1',
        role: Role.USER,
        accessToken: 'token-1',
      }),
      new User({
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password2',
        role: Role.ADMIN,
        accessToken: 'token-2',
      }),
    ];

    const mockRepo = makeMockUserRepository({
      findAll: vi.fn().mockResolvedValue(seedUsers),
    });

    const useCase = new ListUsersUseCase(mockRepo);
    const result = await useCase.execute();

    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER' });
    expect(result[1]).toEqual({
      id: 2,
      name: 'Jane Doe',
      email: 'jane@example.com',
      role: 'ADMIN',
    });
  });
});
