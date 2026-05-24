import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { InMemoryUserRepository } from '../../../outbound/persistence/InMemoryUserRepository.js';
import { TestSeeder, PLAIN_TOKENS } from './__helper__/TestSeeder.js';
import { TestApp } from './__helper__/TestApp.js';

const repo = new InMemoryUserRepository();
const seeder = new TestSeeder(repo);
const { app } = new TestApp(repo);

beforeEach(() => seeder.seed());
afterAll(() => seeder.tearDown());

describe('ListUsersHandler', () => {
  it('ADMIN returns 200 with JSON:API content type and user data without sensitive fields', async () => {
    const res = await app.request('/api/users', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[2]}` }, // user 2 is ADMIN
    });
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

  it('USER returns 403 Forbidden', async () => {
    const res = await app.request('/api/users', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[1]}` }, // user 1 is USER
    });
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '403', title: 'Forbidden' }],
    });
  });
});
