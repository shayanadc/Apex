import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { InMemoryUserRepository } from '../../../outbound/persistence/InMemoryUserRepository.js';
import { TestSeeder, PLAIN_TOKENS } from './__helper__/TestSeeder.js';
import { TestApp } from './__helper__/TestApp.js';

const repo = new InMemoryUserRepository();
const seeder = new TestSeeder(repo);
const { app } = new TestApp(repo);

beforeEach(() => seeder.seed());
afterAll(() => seeder.tearDown());

describe('UpdateUserHandler', () => {
  it('returns 200 with updated JSON:API body on success', async () => {
    const res = await app.request('/api/users/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[1]}`,
      },
      body: JSON.stringify({ name: 'Updated Name' }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      data: { id: 1, name: 'Updated Name', email: 'john@example.com', role: 'USER' },
    });
  });

  it('returns 422 for a non-numeric id', async () => {
    const res = await app.request('/api/users/abc', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[1]}`,
      },
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity', detail: 'Invalid user id' }],
    });
  });

  it('ADMIN patches non-existent user → 404 Not Found', async () => {
    const res = await app.request('/api/users/99', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[2]}`, // user 2 is ADMIN
      },
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '404', title: 'Not Found', detail: 'User with id 99 not found' }],
    });
  });

  it('USER patches non-existent id that is not their own → 403 (no existence leak)', async () => {
    const res = await app.request('/api/users/99', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[1]}`, // user 1 (USER) probing id 99
      },
      body: JSON.stringify({ name: 'Test' }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '403', title: 'Forbidden' }],
    });
  });

  it('returns 422 when email is already in use', async () => {
    const res = await app.request('/api/users/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[1]}`,
      },
      body: JSON.stringify({ email: 'jane@example.com' }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity' }],
    });
  });

  it('returns 422 when patch body is empty', async () => {
    const res = await app.request('/api/users/1', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[1]}`,
      },
      body: JSON.stringify({}),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity' }],
    });
  });
});
