# ApexNevada — User Management API

ApexNevada is a RESTful User Management API built with TypeScript and Hono. The goal was to have a production-ready codebase that is clean enough to extend without needing to understand the whole thing first — so it follows Hexagonal (Ports & Adapters) architecture, which keeps HTTP and database concerns physically separated from business logic.

It supports two storage backends out of the box — an in-memory store for tests and a MySQL 8 database for production — and you can swap between them with a single environment variable.

---

## Stack

- **TypeScript** — strict mode, ESM modules
- **Hono** — lightweight HTTP framework
- **MySQL 8** via `mysql2/promise` (pooled connections)
- **SHA-256** — bearer token hashing
- **Vitest** — unit and integration tests
- **Cucumber.js** — end-to-end tests against a real MySQL instance
- **Docker + Docker Compose** — containerised local development

---

## Architecture

The project follows Hexagonal (Ports & Adapters) architecture. Business logic lives in `domain/` and `application/` and has no knowledge of Hono, MySQL, or any other infrastructure. Adapters in `adapters/` plug in via interfaces (ports) and can be swapped without touching the core.

```
src/
├── domain/          # Entities and value objects — no framework imports allowed
├── application/     # Use cases and port interfaces
├── adapters/
│   ├── inbound/     # HTTP handlers, middleware, validators (driven by the outside world)
│   └── outbound/    # MySQL and in-memory repositories, crypto adapters (driven by the app)
├── composition/     # Wires everything together — one place, no magic
├── infrastructure/  # MySQL connection pool factory
└── index.ts         # Entry point
```

RBAC is enforced at the use-case level. Users can only read and update their own profile. Admins can list, read, update, and delete any user. No user — including an admin — can delete themselves.

All responses follow the JSON:API spec (`Content-Type: application/vnd.api+json`).

---

## Getting Started

**Prerequisites:** Node.js 24 LTS, npm, Docker (for MySQL or E2E tests)

```bash
cp .env.example .env
npm install
```

Edit `.env` if you want to override the defaults. To run against MySQL you'll also need a database — see below.

### Run in-memory (no database needed)

Leave `DB_ENGINE` unset in `.env` and start the dev server:

```bash
npm run dev
```

The server starts on `http://localhost:3000` (or the port in your `.env`).

### Run with MySQL

The easiest path is Docker Compose, which spins up both the app and a MySQL 8 container and applies the schema automatically:

```bash
docker compose up --build
```

If you already have a local MySQL instance, apply the schema manually and set the `DB_*` variables in `.env`:

```bash
mysql -u root -p < db/schema.sql
DB_ENGINE=mysql npm run dev
```

### Build for production

```bash
npm run build
npm start
```

---

## Tests

```bash
npm test               # unit + integration (Vitest)
npm run test:cucumber  # E2E against a real MySQL container
```

The test suite has three tiers:

- **Unit tests** (`src/application/__tests__/`) — use cases in complete isolation, ports are mocked
- **Integration tests** (`src/adapters/inbound/http/__tests__/`) — full Hono stack backed by `InMemoryUserRepository`
- **E2E tests** (`features/`) — real HTTP requests against a live server and MySQL database

The Cucumber command starts a `db-test` Docker container automatically if it's not already running.

---

## API Reference

All endpoints under `/api/*` require an `Authorization: Bearer <token>` header. The token is issued at user creation time and is shown only once.

### Health

| Method | Path | Auth |
|--------|------|------|
| `GET` | `/health` | None |

### Users

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/api/users` | Bearer | Admin only |
| `GET` | `/api/users/:id` | Bearer | Own profile or admin |
| `POST` | `/api/users` | Bearer | Admin only |
| `PATCH` | `/api/users/:id` | Bearer | Own profile or admin; role changes are admin-only |
| `DELETE` | `/api/users/:id` | Bearer | Admin only; cannot delete self |

**Error shape** (all errors):

```json
{
  "errors": [{ "status": "404", "title": "Not Found", "detail": "User with id 99 not found" }]
}
```

**User resource shape**:

```json
{
  "data": {
    "id": 1,
    "name": "Alice",
    "email": "alice@example.com",
    "role": "ADMIN"
  }
}
```

On `POST /api/users`, the response also includes `access_token` at the top level of `data` — this is the only time the plain token is available.

---

## Configuration

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3000` | No | HTTP server port |
| `DB_ENGINE` | *(in-memory)* | No | Set to `mysql` to use MySQL |
| `DB_HOST` | — | When `DB_ENGINE=mysql` | MySQL host |
| `DB_PORT` | `3306` | No | MySQL port |
| `DB_NAME` | — | When `DB_ENGINE=mysql` | Database name |
| `DB_USER` | — | When `DB_ENGINE=mysql` | MySQL user |
| `DB_PASSWORD` | — | When `DB_ENGINE=mysql` | MySQL password |

---

## Development

```bash
npm run lint         # ESLint
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier
npm run format:check # Prettier check only
npx tsc --noEmit     # Type-check without building
```

Git hooks (via Husky) run ESLint + Prettier on staged files before every commit, and the full test suite before every push.