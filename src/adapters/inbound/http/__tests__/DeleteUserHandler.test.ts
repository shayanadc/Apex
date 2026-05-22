import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { InMemoryUserRepository } from '../../../outbound/persistence/InMemoryUserRepository.js';
import { TestSeeder } from './__helper__/TestSeeder.js';
import { TestApp } from './__helper__/TestApp.js';

const repo = new InMemoryUserRepository();
const seeder = new TestSeeder(repo);
const { app } = new TestApp(repo);

beforeEach(() => seeder.seed());
afterAll(() => seeder.tearDown());

describe('DeleteUserHandler', () => {
  it('returns 204 No Content for an existing user id', async () => {
    const res = await app.request('/api/users/1', { method: 'DELETE' });

    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });

  it('returns 404 JSON:API error for a non-existent user id', async () => {
    const res = await app.request('/api/users/99', { method: 'DELETE' });

    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '404', title: 'Not Found', detail: 'User with id 99 not found' }],
    });
  });

  it('returns 422 JSON:API error for a non-numeric id', async () => {
    const res = await app.request('/api/users/abc', { method: 'DELETE' });

    expect(res.status).toBe(422);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity', detail: 'Invalid user id' }],
    });
  });
});
