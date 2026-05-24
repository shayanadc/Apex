import { describe, it, expect, vi } from 'vitest';
import { GetUserUseCase } from '../usecases/GetUserUseCase.js';
import { User } from '../../domain/user/User.js';
import { Role } from '../../domain/user/Role.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';
import { ForbiddenError } from '../../domain/user/errors/ForbiddenError.js';
import { makeMockUserRepository } from './__helper__/makeMockUserRepository.js';
import type { IUserRepository } from '../ports/outbound/IUserRepository.js';

const userActor = new User({
  id: 1,
  name: 'User One',
  email: 'user@example.com',
  password: 'hash1',
  role: Role.USER,
  accessToken: 'tok1',
});
const adminActor = new User({
  id: 2,
  name: 'Admin Two',
  email: 'admin@example.com',
  password: 'hash2',
  role: Role.ADMIN,
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
  makeMockUserRepository({ findById: vi.fn().mockResolvedValue(target) });

describe('GetUserUseCase', () => {
  it('USER reads own profile → returns UserView without sensitive fields', async () => {
    const repo = makeRepo(userActor);
    const result = await new GetUserUseCase(repo).execute({ actor: userActor, targetId: 1 });

    expect(result).toEqual({ id: 1, name: 'User One', email: 'user@example.com', role: 'USER' });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('accessToken');
  });

  it('USER reads another user profile → ForbiddenError', async () => {
    const repo = makeRepo(otherUser);
    await expect(
      new GetUserUseCase(repo).execute({ actor: userActor, targetId: 3 }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('ADMIN reads any existing user → returns UserView', async () => {
    const repo = makeRepo(otherUser);
    const result = await new GetUserUseCase(repo).execute({ actor: adminActor, targetId: 3 });

    expect(result).toEqual({
      id: 3,
      name: 'Other Three',
      email: 'other@example.com',
      role: 'USER',
    });
  });

  it('ADMIN reads non-existent user → UserNotFoundError', async () => {
    const repo = makeRepo(null);
    await expect(
      new GetUserUseCase(repo).execute({ actor: adminActor, targetId: 99 }),
    ).rejects.toThrow(UserNotFoundError);
  });

  it('USER asks for non-existent ID that is not their own → ForbiddenError (no existence leak)', async () => {
    const repo = makeRepo(null);
    await expect(
      new GetUserUseCase(repo).execute({ actor: userActor, targetId: 99 }),
    ).rejects.toThrow(ForbiddenError);
  });

  it('USER asks for non-existent ID that is their own → UserNotFoundError', async () => {
    const repo = makeRepo(null);
    await expect(
      new GetUserUseCase(repo).execute({ actor: userActor, targetId: 1 }),
    ).rejects.toThrow(UserNotFoundError);
  });
});
