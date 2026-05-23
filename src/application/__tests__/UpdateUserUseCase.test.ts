import { describe, it, expect, vi } from 'vitest';
import { UpdateUserUseCase } from '../usecases/UpdateUserUseCase.js';
import { User } from '../../domain/user/User.js';
import { Role } from '../../domain/user/Role.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';
import { EmptyPatchError } from '../errors/EmptyPatchError.js';
import { EmailAlreadyInUseError } from '../../domain/user/errors/EmailAlreadyInUseError.js';
import { makeMockUserRepository } from './__helper__/makeMockUserRepository.js';
import type { IUserRepository } from '../ports/outbound/IUserRepository.js';

describe('UpdateUserUseCase', () => {
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
      findByEmail: vi.fn().mockResolvedValue(null),
      update: vi.fn().mockImplementation((u: User) => Promise.resolve(u)),
    });

  it('returns updated UserView on success', async () => {
    const repo = makeRepo(mockUser);
    const useCase = new UpdateUserUseCase(repo);

    const result = await useCase.execute(1, { name: 'Updated Name' });

    expect(result).toEqual({
      id: 1,
      name: 'Updated Name',
      email: 'john@example.com',
      role: 'USER',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('accessToken');
  });

  it('throws EmptyPatchError when patch has zero keys', async () => {
    const repo = makeRepo(mockUser);
    const useCase = new UpdateUserUseCase(repo);

    await expect(useCase.execute(1, {})).rejects.toThrow(EmptyPatchError);
    expect(repo.findById).not.toHaveBeenCalled();
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('throws UserNotFoundError when user does not exist', async () => {
    const repo = makeRepo(null);
    const useCase = new UpdateUserUseCase(repo);

    await expect(useCase.execute(99, { name: 'Test' })).rejects.toThrow(UserNotFoundError);
    await expect(useCase.execute(99, { name: 'Test' })).rejects.toMatchObject({
      code: 'USER_NOT_FOUND',
      id: 99,
    });
  });

  it('throws EmailAlreadyInUseError when the email belongs to another user', async () => {
    const repo = makeRepo(mockUser);
    const otherUser = new User({
      id: 2,
      name: 'Jane Doe',
      email: 'taken@example.com',
      password: 'password2',
      role: Role.USER,
      accessToken: 'token-2',
    });
    vi.mocked(repo.findByEmail).mockResolvedValue(otherUser);
    const useCase = new UpdateUserUseCase(repo);

    await expect(useCase.execute(1, { email: 'taken@example.com' })).rejects.toThrow(
      EmailAlreadyInUseError,
    );
    await expect(useCase.execute(1, { email: 'taken@example.com' })).rejects.toMatchObject({
      code: 'EMAIL_ALREADY_IN_USE',
    });
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('allows updating to the user own current email', async () => {
    const repo = makeRepo(mockUser);
    vi.mocked(repo.findByEmail).mockResolvedValue(mockUser);
    const useCase = new UpdateUserUseCase(repo);

    const result = await useCase.execute(1, { email: 'john@example.com' });

    expect(result.email).toBe('john@example.com');
    expect(repo.update).toHaveBeenCalled();
  });
});
