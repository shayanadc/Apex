import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { GetUserHandler } from './GetUserHandler.js';
import { GetUserUseCase } from '../../../application/GetUserUseCase.js';
import { InMemoryUserRepository } from '../../persistence/InMemoryUserRepository.js';

describe('GetUserHandler', () => {
  const app = new Hono();
  const handler = new GetUserHandler(new GetUserUseCase(new InMemoryUserRepository()));
  app.get('/api/users/:id', (c) => handler.handle(c));

  it('returns 200 with correct JSON:API body for an existing user', async () => {
    const res = await app.request('/api/users/1');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');

    const body = await res.json();
    expect(body).toMatchObject({
      data: {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        role: 'USER',
      },
    });
    expect(body.data).not.toHaveProperty('password');
    expect(body.data).not.toHaveProperty('accessToken');
  });

  it('returns 404 for a non-existent user id', async () => {
    const res = await app.request('/api/users/99');
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');

    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '404', title: 'Not Found', detail: 'User with id 99 not found' }],
    });
  });

  it('returns 422 for a non-numeric id', async () => {
    const res = await app.request('/api/users/abc');
    expect(res.status).toBe(422);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');

    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity', detail: 'Invalid user id' }],
    });
  });
});
