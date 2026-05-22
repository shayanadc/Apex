import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createContainer } from './composition/container.js';
import { InMemoryUserRepository } from './adapters/outbound/persistence/InMemoryUserRepository.js';
import { Router } from './adapters/inbound/http/Router.js';

const port = Number(process.env.PORT) || 3000;

const router = new Router(createContainer(new InMemoryUserRepository()));

serve({ fetch: router.fetch, port });

console.log(`Server listening on http://localhost:${port}`);
