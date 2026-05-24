import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { InMemoryUserRepository } from '../../../outbound/persistence/InMemoryUserRepository.js';
import { TestSeeder, PLAIN_TOKENS } from './__helper__/TestSeeder.js';
import { TestApp } from './__helper__/TestApp.js';

const repo = new InMemoryUserRepository();
const seeder = new TestSeeder(repo);
const { app } = new TestApp(repo);

beforeEach(() => seeder.seed());
afterAll(() => seeder.tearDown());

describe('DeleteUserHandler', () => {
  it('ADMIN deletes another user → 204 No Content', async () => {
    const res = await app.request('/api/users/1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[2]}` },
    });

    expect(res.status).toBe(204);
    expect(await res.text()).toBe('');
  });

  it('USER deletes themselves → 403 (self-delete blocked)', async () => {
    const res = await app.request('/api/users/1', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[1]}` }, // user 1 (USER) deletes self
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '403', title: 'Forbidden' }],
    });
  });

  it('USER deletes another user → 403 Forbidden', async () => {
    const res = await app.request('/api/users/3', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[1]}` }, // user 1 (USER) deletes user 3
    });

    expect(res.status).toBe(403);
  });

  it('ADMIN deletes non-existent user → 404 Not Found', async () => {
    const res = await app.request('/api/users/99', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[2]}` }, // ADMIN asking non-existent
    });

    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '404', title: 'Not Found', detail: 'User with id 99 not found' }],
    });
  });

  it('returns 422 JSON:API error for a non-numeric id', async () => {
    const res = await app.request('/api/users/abc', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[2]}` },
    });

    expect(res.status).toBe(422);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity', detail: 'Invalid user id' }],
    });
  });
});
