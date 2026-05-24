import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { InMemoryUserRepository } from '../../../outbound/persistence/InMemoryUserRepository.js';
import { TestSeeder, PLAIN_TOKENS } from './__helper__/TestSeeder.js';
import { TestApp } from './__helper__/TestApp.js';
import { makeFakeTokenIssuer } from '../../../../application/__tests__/__helper__/makeTokenIssuer.js';
import { makeFakePasswordHasher } from '../../../../application/__tests__/__helper__/makePasswordHasher.js';

const repo = new InMemoryUserRepository();
const seeder = new TestSeeder(repo);
const { app } = new TestApp(repo, {
  tokenIssuer: makeFakeTokenIssuer('plain-new'),
  passwordHasher: makeFakePasswordHasher(),
});

beforeEach(() => seeder.seed());
afterAll(() => seeder.tearDown());

describe('CreateUserHandler', () => {
  it('ADMIN creates a user → 201 with JSON:API body containing plain access_token', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[2]}`,
      },
      body: JSON.stringify({
        name: 'Charlie',
        email: 'charlie@example.com',
        password: 'secret',
        role: 'USER',
      }),
    });

    expect(res.status).toBe(201);
    expect(res.headers.get('Content-Type')).toContain('application/vnd.api+json');

    const body = await res.json();
    expect(body).toMatchObject({
      data: {
        id: expect.any(Number),
        name: 'Charlie',
        email: 'charlie@example.com',
        role: 'USER',
        access_token: 'plain-new',
      },
    });
    expect(body.data).not.toHaveProperty('password');
  });

  it('plain access_token from the create response authenticates a follow-up request', async () => {
    const createRes = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[2]}`,
      },
      body: JSON.stringify({
        name: 'Dana',
        email: 'dana@example.com',
        password: 'pw',
        role: 'USER',
      }),
    });
    const { id, access_token: token } = (await createRes.json()).data as {
      id: number;
      access_token: string;
    };

    // Round-trips through the middleware: the create flow stored hash(plain),
    // and the middleware hashes the incoming Bearer token the same way.
    const selfRes = await app.request(`/api/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(selfRes.status).toBe(200);
    const selfBody = await selfRes.json();
    expect(selfBody).toMatchObject({ data: { id, name: 'Dana', email: 'dana@example.com' } });
  });

  it('USER cannot create users → 403 Forbidden', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[1]}`,
      },
      body: JSON.stringify({
        name: 'Eve',
        email: 'eve@example.com',
        password: 'pw',
        role: 'ADMIN',
      }),
    });

    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '403', title: 'Forbidden' }],
    });
  });

  it('missing Authorization → 401', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Eve',
        email: 'eve@example.com',
        password: 'pw',
        role: 'USER',
      }),
    });
    expect(res.status).toBe(401);
  });

  it('duplicate email → 422', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[2]}`,
      },
      body: JSON.stringify({
        name: 'Clone',
        email: 'john@example.com',
        password: 'pw',
        role: 'USER',
      }),
    });

    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body).toMatchObject({
      errors: [{ status: '422', title: 'Unprocessable Entity' }],
    });
  });

  it('invalid role → 422', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[2]}`,
      },
      body: JSON.stringify({
        name: 'Bad',
        email: 'bad@example.com',
        password: 'pw',
        role: 'GOD',
      }),
    });
    expect(res.status).toBe(422);
  });

  it('invalid email → 422', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[2]}`,
      },
      body: JSON.stringify({
        name: 'Bad',
        email: 'not-an-email',
        password: 'pw',
        role: 'USER',
      }),
    });
    expect(res.status).toBe(422);
  });

  it('empty password → 422', async () => {
    const res = await app.request('/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PLAIN_TOKENS[2]}`,
      },
      body: JSON.stringify({
        name: 'Bad',
        email: 'bad@example.com',
        password: '   ',
        role: 'USER',
      }),
    });
    expect(res.status).toBe(422);
  });
});
