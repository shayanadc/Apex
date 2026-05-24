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
  it('USER reads own profile → 200 with correct JSON:API body', async () => {
    const res = await app.request('/api/users/1', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[1]}` }, // user 1 reads self
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

  it('ADMIN reads any user → 200', async () => {
    const res = await app.request('/api/users/1', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[2]}` }, // user 2 is ADMIN
    });
    expect(res.status).toBe(200);
  });

  it('USER reads another user → 403 Forbidden', async () => {
    const res = await app.request('/api/users/3', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[1]}` }, // user 1 (USER) reads user 3
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '403', title: 'Forbidden' }],
    });
  });

  it('ADMIN reads non-existent user → 404 Not Found', async () => {
    const res = await app.request('/api/users/99', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[2]}` }, // ADMIN asking non-existent
    });
    expect(res.status).toBe(404);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '404', title: 'Not Found', detail: 'User with id 99 not found' }],
    });
  });

  it('USER asks for non-existent ID that is not their own → 403 (no existence leak)', async () => {
    const res = await app.request('/api/users/99', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[1]}` }, // user 1 (USER) asking for 99
    });
    expect(res.status).toBe(403);
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
