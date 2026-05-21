import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { ListUsersHandler } from '../handlers/ListUsersHandler.js';
import { ListUsersUseCase } from '../../../../application/usecases/ListUsersUseCase.js';
import { InMemoryUserRepository } from '../../../outbound/persistence/InMemoryUserRepository.js';

describe('ListUsersHandler', () => {
  const app = new Hono();
  const handler = new ListUsersHandler(new ListUsersUseCase(new InMemoryUserRepository()));
  app.get('/api/users', (c) => handler.handle(c));

  it('returns 200 with JSON:API content type and user data without sensitive fields', async () => {
    const res = await app.request('/api/users');
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');

    const body = await res.json();
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data).toHaveLength(3);

    const first = body.data[0];
    expect(body).toMatchObject({
      data: expect.arrayContaining([
        expect.objectContaining({
          id: expect.any(Number),
          name: expect.any(String),
          email: expect.any(String),
          role: expect.stringMatching(/^(USER|ADMIN)$/),
        }),
      ]),
    });
    expect(first).not.toHaveProperty('accessToken');
    expect(first).not.toHaveProperty('password');
    expect(first).not.toHaveProperty('type');
  });
});
