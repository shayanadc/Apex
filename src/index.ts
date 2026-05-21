import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import { ListUsersHandler } from './adapters/http/handlers/ListUsersHandler.js';
import { GetUserHandler } from './adapters/http/handlers/GetUserHandler.js';
import { UpdateUserHandler } from './adapters/http/handlers/UpdateUserHandler.js';
import { DeleteUserHandler } from './adapters/http/handlers/DeleteUserHandler.js';
import { ListUsersUseCase } from './application/usecases/ListUsersUseCase.js';
import { GetUserUseCase } from './application/usecases/GetUserUseCase.js';
import { UpdateUserUseCase } from './application/usecases/UpdateUserUseCase.js';
import { DeleteUserUseCase } from './application/usecases/DeleteUserUseCase.js';
import { InMemoryUserRepository } from './adapters/persistence/InMemoryUserRepository.js';

const app = new Hono();
const port = Number(process.env.PORT) || 3000;

const repo = new InMemoryUserRepository();

const listUsersHandler = new ListUsersHandler(new ListUsersUseCase(repo));
const getUserHandler = new GetUserHandler(new GetUserUseCase(repo));
const updateUserHandler = new UpdateUserHandler(new UpdateUserUseCase(repo));
const deleteUserHandler = new DeleteUserHandler(new DeleteUserUseCase(repo));

app.get('/api/users', (c) => listUsersHandler.handle(c));
app.get('/api/users/:id', (c) => getUserHandler.handle(c));
app.patch('/api/users/:id', (c) => updateUserHandler.handle(c));
app.delete('/api/users/:id', (c) => deleteUserHandler.handle(c));

app.get('/health', (c) => {
  return c.json({ meta: { status: 'ok' } }, 200, {
    'Content-Type': 'application/vnd.api+json',
  });
});

serve({ fetch: app.fetch, port });

console.log(`Server listening on http://localhost:${port}`);
