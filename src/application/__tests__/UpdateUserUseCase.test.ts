import { describe, it, expect, vi } from 'vitest';
import { UpdateUserUseCase } from '../usecases/UpdateUserUseCase.js';
import { User } from '../../domain/user/User.js';
import { Role } from '../../domain/user/Role.js';
import { UserNotFoundError } from '../errors/UserNotFoundError.js';
import { EmptyPatchError } from '../errors/EmptyPatchError.js';
import { EmailAlreadyInUseError } from '../../domain/user/errors/EmailAlreadyInUseError.js';
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
const targetUser = new User({
  id: 3,
  name: 'Target Three',
  email: 'target@example.com',
  password: 'hash3',
  role: Role.USER,
  accessToken: 'tok3',
});

const makeRepo = (target: User | null, emailConflict: User | null = null): IUserRepository =>
  makeMockUserRepository({
    findById: vi.fn().mockResolvedValue(target),
    findByEmail: vi.fn().mockResolvedValue(emailConflict),
    update: vi.fn().mockImplementation((u: User) => Promise.resolve(u)),
  });

describe('UpdateUserUseCase', () => {
  it('EmptyPatchError when no patch fields provided — no repo calls', async () => {
    const repo = makeRepo(userActor);
    await expect(
      new UpdateUserUseCase(repo).execute({ actor: userActor, targetUser: { id: 1 } }),
    ).rejects.toThrow(EmptyPatchError);
    expect(repo.findById).not.toHaveBeenCalled();
  });

  it('USER updates own non-role fields → success, returns UserView', async () => {
    const repo = makeRepo(userActor);
    const result = await new UpdateUserUseCase(repo).execute({
      actor: userActor,
      targetUser: { id: 1, name: 'Updated Name' },
    });

    expect(result).toEqual({
      id: 1,
      name: 'Updated Name',
      email: 'user@example.com',
      role: 'USER',
    });
    expect(result).not.toHaveProperty('password');
    expect(result).not.toHaveProperty('accessToken');
  });

  it('USER updates own role → ForbiddenError (role escalation blocked)', async () => {
    const repo = makeRepo(userActor);
    await expect(
      new UpdateUserUseCase(repo).execute({
        actor: userActor,
        targetUser: { id: 1, role: 'ADMIN' },
      }),
    ).rejects.toThrow(ForbiddenError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('USER updates another user → ForbiddenError', async () => {
    const repo = makeRepo(targetUser);
    await expect(
      new UpdateUserUseCase(repo).execute({
        actor: userActor,
        targetUser: { id: 3, name: 'Hacked' },
      }),
    ).rejects.toThrow(ForbiddenError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('ADMIN updates any user name → success', async () => {
    const repo = makeRepo(targetUser);
    const result = await new UpdateUserUseCase(repo).execute({
      actor: adminActor,
      targetUser: { id: 3, name: 'Admin Changed' },
    });

    expect(result.name).toBe('Admin Changed');
    expect(repo.update).toHaveBeenCalled();
  });

  it('ADMIN updates any user role → success', async () => {
    const repo = makeRepo(targetUser);
    const result = await new UpdateUserUseCase(repo).execute({
      actor: adminActor,
      targetUser: { id: 3, role: 'ADMIN' },
    });

    expect(result.role).toBe('ADMIN');
    expect(repo.update).toHaveBeenCalled();
  });

  it('ADMIN updates non-existent user → UserNotFoundError', async () => {
    const repo = makeRepo(null);
    await expect(
      new UpdateUserUseCase(repo).execute({
        actor: adminActor,
        targetUser: { id: 99, name: 'Test' },
      }),
    ).rejects.toThrow(UserNotFoundError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('duplicate email → EmailAlreadyInUseError, update not called', async () => {
    const conflictUser = new User({
      id: 99,
      name: 'Conflict',
      email: 'taken@example.com',
      password: 'hash',
      role: Role.USER,
      accessToken: 'tok',
    });
    const repo = makeRepo(targetUser, conflictUser);
    await expect(
      new UpdateUserUseCase(repo).execute({
        actor: adminActor,
        targetUser: { id: 3, email: 'taken@example.com' },
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);
    expect(repo.update).not.toHaveBeenCalled();
  });

  it('updating to own current email is allowed', async () => {
    const repo = makeRepo(userActor, userActor);
    const result = await new UpdateUserUseCase(repo).execute({
      actor: userActor,
      targetUser: { id: 1, email: 'user@example.com' },
    });

    expect(result.email).toBe('user@example.com');
    expect(repo.update).toHaveBeenCalled();
  });
});
