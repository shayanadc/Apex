import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createContainer } from './composition/container.js';
import { InMemoryUserRepository } from './adapters/outbound/persistence/InMemoryUserRepository.js';
import { AuthMiddleware } from './adapters/inbound/http/middleware/AuthMiddleware.js';
import { HttpErrorBoundary } from './adapters/inbound/http/handlers/HttpErrorBoundary.js';
import { Router } from './adapters/inbound/http/Router.js';

const port = Number(process.env.PORT) || 3000;

const repo = new InMemoryUserRepository();
const authMiddleware = new AuthMiddleware(repo);
const errorBoundary = new HttpErrorBoundary();

const router = new Router(createContainer(repo))
  .onError((err, c) => errorBoundary.handle(c, err))
  .use('/api/*', (c, next) => authMiddleware.handle(c, next))
  .build();

serve({ fetch: router.fetch, port });

console.log(`Server listening on http://localhost:${port}`);
