import 'dotenv/config';
import { Hono } from 'hono';
import { serve } from '@hono/node-server';

const app = new Hono();
const port = Number(process.env.PORT) || 3000;

app.get('/health', (c) => {
  return c.json({ meta: { status: 'ok' } }, 200, {
    'Content-Type': 'application/vnd.api+json',
  });
});

serve({ fetch: app.fetch, port });

console.log(`Server listening on http://localhost:${port}`);
