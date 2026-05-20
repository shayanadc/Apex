import { describe, it, expect, vi } from 'vitest';
import { ListUsersUseCase } from './ListUsersUseCase.js';
import type { IUserRepository } from './ports/IUserRepository.js';
import { User } from '../domain/user/User.js';

describe('ListUsersUseCase', () => {
  it('execute() maps User[] from repository to UserView[]', async () => {
    const seedUsers = [
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
    ];

    const mockFindAll = vi.fn().mockResolvedValue(seedUsers);
    const mockRepo: IUserRepository = { findAll: mockFindAll };

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
