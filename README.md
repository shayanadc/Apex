# ApexNevada — User Management API

A production-grade RESTful User Management API built with TypeScript, Hono, and a Hexagonal (Ports & Adapters) architecture.

---

## Features

- **Health check endpoint** — `GET /health` returns server status with a JSON:API response
- **List users endpoint** — `GET /api/users` returns all users in JSON:API format
- **JSON:API-inspired responses** — all endpoints respond with `Content-Type: application/vnd.api+json`; user resources use a flat `{ data: [...] }` shape (no `type`/`attributes` nesting)
- **Environment variable support** — server port (and future config) is loaded from `.env` via `dotenv`
- **Docker support** — multi-stage Dockerfile and `docker-compose.yml` for containerised local development and deployment

---

## Architecture

The project follows Hexagonal (Ports & Adapters) architecture to keep business logic independent of HTTP and infrastructure concerns.

```
src/
├── domain/          # Entities, port interfaces — no framework or DB imports allowed here
├── application/     # Use cases — orchestrate domain logic, depend only on ports
│   └── ports/       # Output types (e.g. UserView) and driven port interfaces (e.g. IUserRepository)
├── adapters/
│   ├── http/        # Hono controllers and handlers
│   └── persistence/ # In-memory and future DB repository implementations
├── infrastructure/  # App bootstrap, database connection wiring
└── shared/          # Cross-cutting utilities: JSON:API serialiser, error types, constants
```

**Layer rules:**
- `domain/` and `application/` must never import from `adapters/`, `infrastructure/`, or any external framework
- Business logic lives exclusively in `domain/` and `application/`
- Controllers in `adapters/` must not contain business logic
- Use cases map domain entities to output types (e.g. `UserView`) before returning — domain entities are never exposed to adapters
- Use cases depend on repository ports (`IUserRepository`) injected via constructor — never on concrete adapters

---

## Getting Started

### Prerequisites

- Node.js 24 LTS
- npm

### Setup environment

```bash
cp .env.example .env
```

Edit `.env` to override any defaults for your local environment.

### Install

```bash
npm install
```

### Run (development)

```bash
npm run dev
```

The server starts on the port defined by `PORT` in `.env` (default `3000`) and prints:

```
Server listening on http://localhost:3000
```

File changes trigger an automatic restart via `tsx watch`.

### Build (production)

```bash
npm run build
```

Compiles TypeScript to `dist/`. Then start the compiled output with:

```bash
npm start
```

### Run with Docker

From the **repository root**:

```bash
cp .env.example .env

# Build and start
docker compose up --build
```

The app will be accessible at `http://localhost:3000`. To verify:

```bash
curl http://localhost:3000/health
```

Expected response:

```json
{"meta":{"status":"ok"}}
```

To stop:

```bash
docker compose down
```

### Test

```bash
npm test
```

Runs the full Vitest suite. Test files are co-located with their source files.

### Type-check

```bash
npx tsc --noEmit
```

### Lint

```bash
npm run lint

# Auto-fix lint errors
npm run lint:fix
```

ESLint is configured with `@typescript-eslint` (recommended rules + strict additions) and `eslint-config-prettier` to disable any formatting rules that conflict with Prettier.

Key rules enforced:
- `@typescript-eslint/no-explicit-any` — `any` is forbidden
- `@typescript-eslint/explicit-function-return-type` — all functions must declare a return type
- `@typescript-eslint/consistent-type-imports` — type-only imports must use `import type`
- `@typescript-eslint/no-unused-vars` — unused variables are errors (prefix with `_` to ignore)

Config file: `eslint.config.js`

### Format

```bash
# Format all files
npm run format

# Check formatting without writing
npm run format:check
```

Prettier is configured in `.prettierrc`:

| Option | Value |
|--------|-------|
| `singleQuote` | `true` |
| `semi` | `true` |
| `trailingComma` | `"all"` |
| `printWidth` | `100` |
| `tabWidth` | `2` |
| `endOfLine` | `"lf"` |

### Git hooks

[Husky v9](https://typicode.github.io/husky/) manages two git hooks, both activated automatically on `npm install`:

**pre-commit** — runs [lint-staged](https://github.com/lint-staged/lint-staged) on staged `.ts` files:
1. `eslint --fix` — fixes lint violations in place
2. `prettier --write` — formats the file

If either step fails, the commit is aborted.

**pre-push** — runs `npm test` before any push. If tests fail, the push is aborted.

---

## API Reference

### Health

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/health` | None | Returns server health status |

**Response — 200 OK**

```http
Content-Type: application/vnd.api+json

{"meta":{"status":"ok"}}
```

---

### Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/users` | None | Returns all users |

**Response — 200 OK**

```http
Content-Type: application/vnd.api+json

{
  "data": [
    {
      "id": "1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER",
      "accessToken": "token-1"
    }
  ]
}
```



## Configuration

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3000` | No | Port the HTTP server listens on |