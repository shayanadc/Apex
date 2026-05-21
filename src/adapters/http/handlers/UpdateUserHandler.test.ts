import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { UpdateUserHandler } from './UpdateUserHandler.js';
import { UpdateUserUseCase } from '../../../application/usecases/UpdateUserUseCase.js';
import { UserNotFoundError } from '../../../application/errors/UserNotFoundError.js';
import { EmailAlreadyInUseError } from '../../../domain/user/errors/EmailAlreadyInUseError.js';
import { EmptyPatchError } from '../../../application/errors/EmptyPatchError.js';
import { InMemoryUserRepository } from '../../persistence/InMemoryUserRepository.js';

const makeApp = (useCase: UpdateUserUseCase): Hono => {
  const app = new Hono();
  const handler = new UpdateUserHandler(useCase);
  app.patch('/api/users/:id', (c) => handler.handle(c));
  return app;
};

const makeMockUseCase = (): UpdateUserUseCase =>
  ({
    execute: vi.fn(),
  }) as unknown as UpdateUserUseCase;

describe('UpdateUserHandler', () => {
  it('returns 200 with updated JSON:API body on success', async () => {
    const useCase = makeMockUseCase();
    vi.mocked(useCase.execute).mockResolvedValue({
      id: 1,
      name: 'Updated Name',
      email: 'john@example.com',
      role: 'USER',
    });
    const app = makeApp(useCase);

    const res = await app.request('/api/users/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated Name' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({ data: { id: 1, name: 'Updated Name' } });
  });

  it('returns 422 for a non-numeric id', async () => {
    const app = makeApp(new UpdateUserUseCase(new InMemoryUserRepository()));

    const res = await app.request('/api/users/abc', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity', detail: 'Invalid user id' }],
    });
  });

  it('returns 404 when user is not found', async () => {
    const useCase = makeMockUseCase();
    vi.mocked(useCase.execute).mockRejectedValue(new UserNotFoundError(99));
    const app = makeApp(useCase);

    const res = await app.request('/api/users/99', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '404', title: 'Not Found', detail: 'User with id 99 not found' }],
    });
  });

  it('returns 422 when email is already in use', async () => {
    const useCase = makeMockUseCase();
    vi.mocked(useCase.execute).mockRejectedValue(new EmailAlreadyInUseError('taken@example.com'));
    const app = makeApp(useCase);

    const res = await app.request('/api/users/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'taken@example.com' }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity' }],
    });
  });

  it('returns 422 when patch body is empty', async () => {
    const useCase = makeMockUseCase();
    vi.mocked(useCase.execute).mockRejectedValue(new EmptyPatchError());
    const app = makeApp(useCase);

    const res = await app.request('/api/users/1', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity' }],
    });
  });
});
