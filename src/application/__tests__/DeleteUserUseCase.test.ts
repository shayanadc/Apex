import { describe, it, expect, vi } from 'vitest';
import { DeleteUserUseCase } from '../usecases/DeleteUserUseCase.js';
import { User } from '../../domain/user/User.js';
import { Role } from '../../domain/user/Role.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';
import { makeMockUserRepository } from './__helper__/makeMockUserRepository.js';
import type { IUserRepository } from '../ports/outbound/IUserRepository.js';

describe('DeleteUserUseCase', () => {
  const mockUser = new User({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password1',
    role: Role.USER,
    accessToken: 'token-1',
  });

  const makeRepo = (user: User | null): IUserRepository =>
    makeMockUserRepository({
      findById: vi.fn().mockResolvedValue(user),
      delete: vi.fn().mockResolvedValue(undefined),
    });

  it('resolves void when the user exists', async () => {
    const repo = makeRepo(mockUser);
    const useCase = new DeleteUserUseCase(repo);

    await expect(useCase.execute(1)).resolves.toBeUndefined();
    expect(repo.findById).toHaveBeenCalledWith(1);
    expect(repo.delete).toHaveBeenCalledWith(1);
  });

  it('throws UserNotFoundError with code USER_NOT_FOUND when user does not exist', async () => {
    const repo = makeRepo(null);
    const useCase = new DeleteUserUseCase(repo);

    await expect(useCase.execute(99)).rejects.toThrow(UserNotFoundError);
    await expect(useCase.execute(99)).rejects.toMatchObject({ code: 'USER_NOT_FOUND', id: 99 });
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
