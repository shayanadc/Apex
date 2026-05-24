import 'dotenv/config';
import { Container } from './composition/Container.js';
import { Server } from './adapters/inbound/http/Server.js';

const port = Number(process.env.PORT) || 3000;

const server = new Server(new Container());
server.start(port);

console.log(`Server listening on http://localhost:${port}`);
