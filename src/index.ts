import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { ListUsersHandler } from './adapters/http/handlers/ListUsersHandler.js';
import { ListUsersUseCase } from './application/ListUsersUseCase.js';
import { InMemoryUserRepository } from './adapters/persistence/InMemoryUserRepository.js';

const app = new Hono();
const port = Number(process.env.PORT) || 3000;

const listUsersHandler = new ListUsersHandler(new ListUsersUseCase(new InMemoryUserRepository()));
app.get('/api/users', (c) => listUsersHandler.handle(c));

app.get('/health', (c) => {
  return c.json({ meta: { status: 'ok' } }, 200, {
    'Content-Type': 'application/vnd.api+json',
  });
});

serve({ fetch: app.fetch, port });

console.log(`Server listening on http://localhost:${port}`);
