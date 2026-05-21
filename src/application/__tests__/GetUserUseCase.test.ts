import { describe, it, expect, vi } from 'vitest';
import { GetUserUseCase } from '../usecases/GetUserUseCase.js';
import type { IUserRepository } from '../ports/IUserRepository.js';
import { User } from '../../domain/user/User.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';

describe('GetUserUseCase', () => {
  const mockUser = new User({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password1',
    role: 'USER',
    accessToken: 'token-1',
  });

  const makeMockRepo = (user: User | null): IUserRepository => ({
    findAll: vi.fn(),
    findById: vi.fn().mockResolvedValue(user),
    findByEmail: vi.fn(),
    update: vi.fn(),
    delete: vi.fn().mockResolvedValue(undefined),
  });

  it('returns a UserView when the user is found', async () => {
    const repo = makeMockRepo(mockUser);
    const useCase = new GetUserUseCase(repo);

    const result = await useCase.execute(1);

    expect(result).toEqual({ id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER' });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('accessToken');
  });

  it('throws UserNotFoundError when the user is not found', async () => {
    const repo = makeMockRepo(null);
    const useCase = new GetUserUseCase(repo);

    await expect(useCase.execute(99)).rejects.toThrow(UserNotFoundError);
    await expect(useCase.execute(99)).rejects.toMatchObject({ code: 'USER_NOT_FOUND', id: 99 });
  });
});
