import 'dotenv/config';
import type { Pool } from 'mysql2/promise';
import { Container } from './composition/Container.js';
import { Server } from './adapters/inbound/http/Server.js';
import { InMemoryUserRepository } from './adapters/outbound/persistence/InMemoryUserRepository.js';
import { MySqlUserRepository } from './adapters/outbound/persistence/MySqlUserRepository.js';
import { createMysqlPool } from './infrastructure/db/createMysqlPool.js';
import type { IUserRepository } from './application/ports/outbound/IUserRepository.js';

const port = Number(process.env.PORT) || 3000;

let pool: Pool | null = null;
let userRepository: IUserRepository;

if (process.env.DB_ENGINE === 'mysql') {
  pool = createMysqlPool();
  userRepository = new MySqlUserRepository(pool);
} else {
  userRepository = new InMemoryUserRepository();
}

const container = new Container({ userRepository });
const server = new Server(container);
server.start(port);

console.log(`Server listening on http://localhost:${port}`);

async function shutdown(signal: string): Promise<void> {
  console.log(`Received ${signal}, shutting down gracefully…`);
  if (pool) {
    await pool.end();
  }
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
