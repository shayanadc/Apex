import 'dotenv/config';
import { Container } from './composition/Container.js';
import { Server } from './adapters/inbound/http/Server.js';

const port = Number(process.env.PORT) || 3000;

const container = new Container();
const server = new Server(container);
server.start(port);

console.log(`Server listening on http://localhost:${port}`);

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down gracefully…`);
  await container.dispose();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
