import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { InMemoryUserRepository } from '../../../outbound/persistence/InMemoryUserRepository.js';
import { TestSeeder, PLAIN_TOKENS } from './__helper__/TestSeeder.js';
import { TestApp } from './__helper__/TestApp.js';

const repo = new InMemoryUserRepository();
const seeder = new TestSeeder(repo);
const { app } = new TestApp(repo);

beforeEach(() => seeder.seed());
afterAll(() => seeder.tearDown());

describe('AuthMiddleware', () => {
  it('allows a valid token through and returns 200 on GET /api/users', async () => {
    const res = await app.request('/api/users', {
      headers: { Authorization: `Bearer ${PLAIN_TOKENS[2]}` }, // user 2 is ADMIN
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
  });

  it('returns 401 JSON:API when Authorization header is missing', async () => {
    const res = await app.request('/api/users');
    expect(res.status).toBe(401);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '401', title: 'Unauthorized' }],
    });
  });

  it('returns 401 JSON:API when the token is invalid or unknown', async () => {
    const res = await app.request('/api/users', {
      headers: { Authorization: 'Bearer invalid-unknown-token' },
    });
    expect(res.status).toBe(401);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '401', title: 'Unauthorized' }],
    });
  });

  it('bypasses auth for GET /health and returns 200', async () => {
    const res = await app.request('/health');
    expect(res.status).toBe(200);
  });
});
