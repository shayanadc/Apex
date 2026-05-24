import { describe, it, expect, vi } from 'vitest';
import { DeleteUserUseCase } from '../usecases/DeleteUserUseCase.js';
import { User } from '../../domain/user/User.js';
import { Role } from '../../domain/user/Role.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';
import { ForbiddenError } from '../../domain/user/errors/ForbiddenError.js';
import { CannotDeleteSelfError } from '../../domain/user/errors/CannotDeleteSelfError.js';
import { makeMockUserRepository } from './__helper__/makeMockUserRepository.js';
import type { IUserRepository } from '../ports/outbound/IUserRepository.js';

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
const otherUser = new User({
  id: 3,
  name: 'Other Three',
  email: 'other@example.com',
  password: 'hash3',
  role: Role.USER,
  accessToken: 'tok3',
});

const makeRepo = (target: User | null): IUserRepository =>
  makeMockUserRepository({
    findById: vi.fn().mockResolvedValue(target),
    delete: vi.fn().mockResolvedValue(undefined),
  });

describe('DeleteUserUseCase', () => {
  it('ADMIN deletes another user → resolves void, delete called', async () => {
    const repo = makeRepo(otherUser);
    await expect(
      new DeleteUserUseCase(repo).execute({ actor: adminActor, targetId: 3 }),
    ).resolves.toBeUndefined();
    expect(repo.delete).toHaveBeenCalledWith(3);
  });

  it('ADMIN deletes themselves → CannotDeleteSelfError', async () => {
    const repo = makeRepo(adminActor);
    await expect(
      new DeleteUserUseCase(repo).execute({ actor: adminActor, targetId: 1 }),
    ).rejects.toThrow(CannotDeleteSelfError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('USER deletes themselves → CannotDeleteSelfError', async () => {
    const repo = makeRepo(userActor);
    await expect(
      new DeleteUserUseCase(repo).execute({ actor: userActor, targetId: 2 }),
    ).rejects.toThrow(CannotDeleteSelfError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('USER deletes another user → ForbiddenError', async () => {
    const repo = makeRepo(otherUser);
    await expect(
      new DeleteUserUseCase(repo).execute({ actor: userActor, targetId: 3 }),
    ).rejects.toThrow(ForbiddenError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('ADMIN deletes non-existent user → UserNotFoundError', async () => {
    const repo = makeRepo(null);
    await expect(
      new DeleteUserUseCase(repo).execute({ actor: adminActor, targetId: 99 }),
    ).rejects.toThrow(UserNotFoundError);
    expect(repo.delete).not.toHaveBeenCalled();
  });

  it('USER deletes non-existent id that is not their own → ForbiddenError (no existence leak)', async () => {
    const repo = makeRepo(null);
    await expect(
      new DeleteUserUseCase(repo).execute({ actor: userActor, targetId: 99 }),
    ).rejects.toThrow(ForbiddenError);
    expect(repo.delete).not.toHaveBeenCalled();
  });
});
