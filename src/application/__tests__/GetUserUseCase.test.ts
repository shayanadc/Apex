import { describe, it, expect, vi } from 'vitest';
import { GetUserUseCase } from '../usecases/GetUserUseCase.js';
import { User } from '../../domain/user/User.js';
import { Role } from '../../domain/user/Role.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';
import { makeMockUserRepository } from './__helper__/makeMockUserRepository.js';
import type { IUserRepository } from '../ports/outbound/IUserRepository.js';

describe('GetUserUseCase', () => {
  const mockUser = new User({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password1',
    role: Role.USER,
    accessToken: 'token-1',
  });

  const makeRepo = (user: User | null): IUserRepository =>
    makeMockUserRepository({ findById: vi.fn().mockResolvedValue(user) });

  it('returns a UserView when the user is found', async () => {
    const repo = makeRepo(mockUser);
    const useCase = new GetUserUseCase(repo);

    const result = await useCase.execute(1);

    expect(result).toEqual({ id: 1, name: 'John Doe', email: 'john@example.com', role: 'USER' });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('accessToken');
  });

  it('throws UserNotFoundError when the user is not found', async () => {
    const repo = makeRepo(null);
    const useCase = new GetUserUseCase(repo);

    await expect(useCase.execute(99)).rejects.toThrow(UserNotFoundError);
    await expect(useCase.execute(99)).rejects.toMatchObject({ code: 'USER_NOT_FOUND', id: 99 });
  });
});
