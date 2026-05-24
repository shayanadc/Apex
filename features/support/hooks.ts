import { BeforeAll, AfterAll, Before, After } from '@cucumber/cucumber';
import { config } from 'dotenv';
import { resolve } from 'node:path';
import mysql from 'mysql2/promise';
import type { Pool } from 'mysql2/promise';
import { serve } from '@hono/node-server';
import type { ServerType } from '@hono/node-server';
import { Container } from '../../src/composition/Container.js';
import { Server } from '../../src/adapters/inbound/http/Server.js';
import { ScryptPasswordHasher } from '../../src/adapters/outbound/crypto/ScryptPasswordHasher.js';
import { Sha256TokenIssuer } from '../../src/adapters/outbound/crypto/Sha256TokenIssuer.js';
import { MySqlUserRepository } from '../../src/adapters/outbound/persistence/MySqlUserRepository.js';
import { Role } from '../../src/domain/user/Role.js';
import type { AppWorld } from './world.js';

const ADMIN_PLAIN_TOKEN = 'alice-token';
const ADMIN_PLAIN_PASSWORD = 'password123';

let sharedPool: Pool;
let sharedServer: ServerType;

BeforeAll(async () => {
  config({ path: resolve(process.cwd(), '.env.test') });

  sharedPool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    multipleStatements: false,
  });

  const container = new Container();
  const server = new Server(container);
  const port = Number(process.env.PORT) || 3099;

  sharedServer = serve({ fetch: server.app.fetch, port });
});

Before(async function (this: AppWorld) {
  this.pool = sharedPool;
  this.adminToken = ADMIN_PLAIN_TOKEN;
  this.lastResponse = undefined;
  this.lastCreatedUserId = 0;
  this.lastCreatedUserToken = '';
  this.users = new Map();

  await this.pool.execute('DELETE FROM users');

  const repo = new MySqlUserRepository(this.pool);
  const passwordHasher = new ScryptPasswordHasher();
  const tokenIssuer = new Sha256TokenIssuer();

  const hashedPassword = await passwordHasher.hash(ADMIN_PLAIN_PASSWORD);

  const alice = await repo.save({
    name: 'Alice',
    email: 'alice@example.com',
    password: hashedPassword,
    accessToken: tokenIssuer.hash(ADMIN_PLAIN_TOKEN),
    role: Role.ADMIN,
  });

  this.adminId = alice.getId();
});

After(async function (this: AppWorld) {
  await this.pool.execute('DELETE FROM users');
});

AfterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    sharedServer.close((err) => (err ? reject(err) : resolve()));
  });
  await sharedPool.end();
});
