import { describe, it, expect, vi, type Mock } from 'vitest';
import { CreateUserUseCase } from '../usecases/CreateUserUseCase.js';
import { User, type NewUserData } from '../../domain/user/User.js';
import { Role } from '../../domain/user/Role.js';
import { Email } from '../../domain/user/Email.js';
import { EmailAlreadyInUseError } from '../../domain/user/errors/EmailAlreadyInUseError.js';
import { ForbiddenError } from '../../domain/user/errors/ForbiddenError.js';
import { InvalidUserError } from '../../domain/user/errors/InvalidUserError.js';
import { InvalidRoleError } from '../../domain/user/errors/InvalidRoleError.js';
import { makeMockUserRepository } from './__helper__/makeMockUserRepository.js';
import { makeFakePasswordHasher } from './__helper__/makePasswordHasher.js';
import { makeFakeTokenIssuer } from './__helper__/makeTokenIssuer.js';
import { createHash } from 'node:crypto';

const sha256 = (plain: string): string => createHash('sha256').update(plain).digest('hex');

const adminActor = User.create({
  id: 1,
  name: 'Admin',
  email: Email.create('admin@example.com'),
  password: 'hashed',
  role: Role.ADMIN,
  accessToken: 'tok-admin',
});
const userActor = User.create({
  id: 2,
  name: 'Regular',
  email: Email.create('user@example.com'),
  password: 'hashed',
  role: Role.USER,
  accessToken: 'tok-user',
});

const validNewUser = {
  name: 'Charlie',
  email: 'charlie@example.com',
  password: 'plain-password',
  role: 'USER' as const,
};

/**
 * Builds a `save` mock that mirrors a real repository: it constructs the
 * User aggregate from the draft and assigns the given id. Use case tests
 * use this so we can both inspect what was passed and get a real User back.
 */
function makeSaveMock(assignedId: number): Mock<(draft: NewUserData) => Promise<User>> {
  return vi.fn((draft: NewUserData) => Promise.resolve(User.create({ id: assignedId, ...draft })));
}

describe('CreateUserUseCase', () => {
  it('ADMIN creates a user → returns CreatedUserView with plain access_token', async () => {
    const repo = makeMockUserRepository({
      findByEmail: vi.fn().mockResolvedValue(null),
      save: makeSaveMock(42),
    });
    const hasher = makeFakePasswordHasher();
    const issuer = makeFakeTokenIssuer('plain-xyz');

    const result = await new CreateUserUseCase(repo, hasher, issuer).execute({
      actor: adminActor,
      newUser: validNewUser,
    });

    expect(result).toEqual({
      id: 42,
      name: 'Charlie',
      email: 'charlie@example.com',
      role: 'USER',
      access_token: 'plain-xyz',
    });
  });

  it('passes hashed password and hashed token to the repository (never the plain values)', async () => {
    const save = makeSaveMock(1);
    const repo = makeMockUserRepository({
      findByEmail: vi.fn().mockResolvedValue(null),
      save,
    });
    const hasher = makeFakePasswordHasher();
    const issuer = makeFakeTokenIssuer('plain-xyz');

    await new CreateUserUseCase(repo, hasher, issuer).execute({
      actor: adminActor,
      newUser: validNewUser,
    });

    expect(hasher.hash).toHaveBeenCalledWith('plain-password');
    expect(save).toHaveBeenCalledWith(
      expect.objectContaining({
        password: 'hashed:plain-password',
        accessToken: sha256('plain-xyz'),
      }),
    );
    const draft = save.mock.calls[0]![0]! as NewUserData;
    expect(draft.password).not.toBe('plain-password');
    expect(draft.accessToken).not.toBe('plain-xyz');
  });

  it('USER cannot create users → ForbiddenError, repo never queried', async () => {
    const repo = makeMockUserRepository({ findByEmail: vi.fn(), save: vi.fn() });
    const hasher = makeFakePasswordHasher();
    const issuer = makeFakeTokenIssuer();

    await expect(
      new CreateUserUseCase(repo, hasher, issuer).execute({
        actor: userActor,
        newUser: validNewUser,
      }),
    ).rejects.toThrow(ForbiddenError);
    expect(repo.findByEmail).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
    expect(hasher.hash).not.toHaveBeenCalled();
  });

  it('duplicate email → EmailAlreadyInUseError, never hashes or saves', async () => {
    const existing = User.create({
      id: 7,
      name: 'Existing',
      email: Email.create('charlie@example.com'),
      password: 'h',
      role: Role.USER,
      accessToken: 't',
    });
    const repo = makeMockUserRepository({
      findByEmail: vi.fn().mockResolvedValue(existing),
      save: vi.fn(),
    });
    const hasher = makeFakePasswordHasher();
    const issuer = makeFakeTokenIssuer();

    await expect(
      new CreateUserUseCase(repo, hasher, issuer).execute({
        actor: adminActor,
        newUser: validNewUser,
      }),
    ).rejects.toThrow(EmailAlreadyInUseError);
    expect(hasher.hash).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('empty password → InvalidUserError before hashing', async () => {
    const repo = makeMockUserRepository({ findByEmail: vi.fn(), save: vi.fn() });
    const hasher = makeFakePasswordHasher();
    const issuer = makeFakeTokenIssuer();

    await expect(
      new CreateUserUseCase(repo, hasher, issuer).execute({
        actor: adminActor,
        newUser: { ...validNewUser, password: '   ' },
      }),
    ).rejects.toThrow(InvalidUserError);
    expect(hasher.hash).not.toHaveBeenCalled();
    expect(repo.save).not.toHaveBeenCalled();
  });

  it('unknown role → InvalidRoleError before hashing', async () => {
    const repo = makeMockUserRepository({ findByEmail: vi.fn(), save: vi.fn() });
    const hasher = makeFakePasswordHasher();
    const issuer = makeFakeTokenIssuer();

    await expect(
      new CreateUserUseCase(repo, hasher, issuer).execute({
        actor: adminActor,
        newUser: { ...validNewUser, role: 'GOD' },
      }),
    ).rejects.toThrow(InvalidRoleError);
    expect(hasher.hash).not.toHaveBeenCalled();
  });
});
