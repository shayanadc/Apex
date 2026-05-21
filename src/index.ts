import 'dotenv/config';
import { serve } from '@hono/node-server';
import { createContainer } from './composition/container.js';
import { Router } from './adapters/http/router.js';

const port = Number(process.env.PORT) || 3000;

const router = new Router(createContainer());

serve({ fetch: router.fetch, port });

console.log(`Server listening on http://localhost:${port}`);
