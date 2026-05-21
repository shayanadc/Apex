import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';
import { DeleteUserHandler } from '../http/handlers/DeleteUserHandler.js';
import { DeleteUserUseCase } from '../../application/usecases/DeleteUserUseCase.js';
import { UserNotFoundError } from '../../application/errors/UserNotFoundError.js';
import { InMemoryUserRepository } from '../persistence/InMemoryUserRepository.js';

const makeApp = (useCase: DeleteUserUseCase): Hono => {
  const app = new Hono();
  const handler = new DeleteUserHandler(useCase);
  app.delete('/api/users/:id', (c) => handler.handle(c));
  return app;
};

const makeMockUseCase = (): DeleteUserUseCase =>
  ({
    execute: vi.fn(),
  }) as unknown as DeleteUserUseCase;

describe('DeleteUserHandler', () => {
  it('returns 204 No Content for an existing user id', async () => {
    const useCase = makeMockUseCase();
    vi.mocked(useCase.execute).mockResolvedValue(undefined);
    const app = makeApp(useCase);

    const res = await app.request('/api/users/1', { method: 'DELETE' });

    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });

  it('returns 404 JSON:API error for a non-existent user id', async () => {
    const useCase = makeMockUseCase();
    vi.mocked(useCase.execute).mockRejectedValue(new UserNotFoundError(99));
    const app = makeApp(useCase);

    const res = await app.request('/api/users/99', { method: 'DELETE' });

    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '404', title: 'Not Found', detail: 'User with id 99 not found' }],
    });
  });

  it('returns 422 JSON:API error for a non-numeric id', async () => {
    const app = makeApp(new DeleteUserUseCase(new InMemoryUserRepository()));

    const res = await app.request('/api/users/abc', { method: 'DELETE' });

    expect(res.status).toBe(422);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity', detail: 'Invalid user id' }],
    });
  });
});
