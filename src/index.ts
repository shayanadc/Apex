import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createContainer } from './composition/container.js';
import { InMemoryUserRepository } from './adapters/outbound/persistence/InMemoryUserRepository.js';
import { AuthMiddleware } from './adapters/inbound/http/middleware/AuthMiddleware.js';
import { HttpErrorResponder } from './adapters/inbound/http/HttpErrorResponder.js';
import { Router } from './adapters/inbound/http/Router.js';

const port = Number(process.env.PORT) || 3000;

const repo = new InMemoryUserRepository();
const authMiddleware = new AuthMiddleware(repo);
const errorResponder = new HttpErrorResponder();

const router = new Router(createContainer(repo))
  .onError((err, c) => errorResponder.respond(c, err))
  .use('/api/*', (c, next) => authMiddleware.handle(c, next))
  .build();

serve({ fetch: router.fetch, port });

console.log(`Server listening on http://localhost:${port}`);
