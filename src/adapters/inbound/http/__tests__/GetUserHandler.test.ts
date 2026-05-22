import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { InMemoryUserRepository } from '../../../outbound/persistence/InMemoryUserRepository.js';
import { TestSeeder, PLAIN_TOKENS } from './__helper__/TestSeeder.js';
import { TestApp } from './__helper__/TestApp.js';

const repo = new InMemoryUserRepository();
const seeder = new TestSeeder(repo);
const { app } = new TestApp(repo);

beforeEach(() => seeder.seed());
afterAll(() => seeder.tearDown());

describe('GetUserHandler', () => {
  it('returns 200 with correct JSON:API body for an existing user', async () => {
    const res = await app.request('/api/users/1', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[1]}` },
    });
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
    const res = await app.request('/api/users/99', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[1]}` },
    });
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');

    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '404', title: 'Not Found', detail: 'User with id 99 not found' }],
    });
  });

  it('returns 422 for a non-numeric id', async () => {
    const res = await app.request('/api/users/abc', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[1]}` },
    });
    expect(res.status).toBe(422);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');

    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity', detail: 'Invalid user id' }],
    });
  });
});
