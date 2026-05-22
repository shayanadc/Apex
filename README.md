# ApexNevada — User Management API

A production-grade RESTful User Management API built with TypeScript, Hono, and a Hexagonal (Ports & Adapters) architecture.

---

## Features

- **Health check endpoint** — `GET /health` returns server status with a JSON:API response; **not** gated by auth
- **Bearer token authentication** — all `/api/*` routes require an `Authorization: Bearer <token>` header; missing or invalid tokens return `401 Unauthorized` in JSON:API format
- **List users endpoint** — `GET /api/users` returns all users in JSON:API format
- **Get user by ID endpoint** — `GET /api/users/:id` returns a single user; 404 if not found, 422 if the id is non-numeric
- **Update user by ID endpoint** — `PATCH /api/users/:id` partially updates `name`, `email`, or `role`; 200 on success, 404 if not found, 422 for invalid id / empty patch / email conflict
- **Delete user by ID endpoint** — `DELETE /api/users/:id` removes a user; 204 No Content on success, 404 if not found, 422 if the id is non-numeric
- **JSON:API-inspired responses** — all endpoints respond with `Content-Type: application/vnd.api+json`; user resources use a flat `{ data: [...] }` shape (no `type`/`attributes` nesting)
- **Environment variable support** — server port (and future config) is loaded from `.env` via `dotenv`
- **Docker support** — multi-stage Dockerfile and `docker-compose.yml` for containerised local development and deployment

---

## Architecture

The project follows Hexagonal (Ports & Adapters) architecture to keep business logic independent of HTTP and infrastructure concerns.

```
src/
├── domain/                  # Entities and domain error types — no framework or DB imports allowed here
├── application/             # Application layer — orchestrates domain logic, depends only on ports
│   ├── usecases/            # Use cases (e.g. ListUsersUseCase, GetUserUseCase)
│   ├── ports/
│   │   ├── inbound/         # Use-case I/O contracts (e.g. UpdateUserCommand, UserView)
│   │   └── outbound/        # Driven port interfaces (e.g. IUserRepository)
│   ├── errors/              # Application-layer error types
│   └── __tests__/           # Use-case unit tests
├── adapters/
│   ├── inbound/             # Driving adapters — drive the application
│   │   └── http/            # Hono router and request handlers (+ __tests__/)
│   └── outbound/            # Driven adapters — driven by the application
│       └── persistence/     # In-memory and future DB repository implementations
├── composition/             # Composition root — wires adapters, use cases, and handlers
└── index.ts                 # Bootstrap entry point
```

Adapters and ports are split by direction: **inbound** (driving) elements receive input and drive the application; **outbound** (driven) elements are invoked by the application to reach infrastructure.

**Layer rules:**
- `domain/` and `application/` must never import from `adapters/` or any external framework
- Business logic lives exclusively in `domain/` and `application/`
- Controllers in `adapters/` must not contain business logic
- Use cases map domain entities to output types (e.g. `UserView`) before returning — domain entities are never exposed to adapters
- Use cases depend on outbound ports (`IUserRepository`) injected via constructor — never on concrete adapters
- Inbound adapters (HTTP handlers) drive use cases through inbound port contracts (`UpdateUserCommand`, `UserView`)

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

Runs the full Vitest suite. The project uses two distinct test tiers:

**Application layer — unit tests** (`src/application/__tests__/`)
Use-case tests inject mock `IUserRepository` implementations via `vi.fn()`. They verify business logic in complete isolation — no HTTP, no framework, no real adapter.

**Adapter layer — integration-style tests** (`src/adapters/inbound/http/__tests__/`)
Handler tests exercise the full Hono application — same `Router`, same middleware stack, same wiring as production — backed by a real `InMemoryUserRepository`. Two helper classes in `__helper__/` support this:

- **`TestApp`** — wires `InMemoryUserRepository → createContainer → Router` and exposes the configured `Hono` app.
- **`TestSeeder`** — seeds three canonical users before each test via `IUserRepository.save()` and tears them down after all tests via `IUserRepository.delete()`. No mocks or fakes appear in adapter tests.

```ts
const repo = new InMemoryUserRepository();
const seeder = new TestSeeder(repo);
const { app } = new TestApp(repo);

beforeEach(() => seeder.seed());
afterAll(() => seeder.tearDown());
```

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
| `GET` | `/api/users` | Bearer token | Returns all users |
| `GET` | `/api/users/:id` | Bearer token | Returns a single user by numeric ID |
| `PATCH` | `/api/users/:id` | Bearer token | Partially updates a user (`name`, `email`, `role`) |
| `DELETE` | `/api/users/:id` | Bearer token | Deletes a user by numeric ID |

**Authentication**

All `/api/*` endpoints require an `Authorization` header:

```http
Authorization: Bearer <raw-token>
```

The raw token is SHA-256 hashed and compared against the stored hash on the matched user.

**Response — 401 Unauthorized** (missing or invalid token)

```http
Content-Type: application/vnd.api+json

{
  "errors": [{ "status": "401", "title": "Unauthorized", "detail": "Missing or malformed Authorization header" }]
}
```

**Response — 200 OK** (`GET /api/users`)

```http
Content-Type: application/vnd.api+json

{
  "data": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "role": "USER"
    }
  ]
}
```

**Response — 200 OK** (`GET /api/users/:id`)

```http
Content-Type: application/vnd.api+json

{
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER"
  }
}
```

**Response — 404 Not Found**

```http
Content-Type: application/vnd.api+json

{
  "errors": [{ "status": "404", "title": "Not Found", "detail": "User with id 99 not found" }]
}
```

**Response — 422 Unprocessable Entity** (non-numeric id)

```http
Content-Type: application/vnd.api+json

{
  "errors": [{ "status": "422", "title": "Unprocessable Entity", "detail": "Invalid user id" }]
}
```

---

### `PATCH /api/users/:id`

Partially updates `name`, `email`, and/or `role` for the user with the given ID. At least one field must be provided.

**Request body**

```http
Content-Type: application/json

{
  "name": "New Name",
  "email": "new@example.com",
  "role": "ADMIN"
}
```

All fields are optional, but at least one must be present.

**Response — 200 OK**

```http
Content-Type: application/vnd.api+json

{
  "data": {
    "id": 1,
    "name": "New Name",
    "email": "new@example.com",
    "role": "ADMIN"
  }
}
```

**Response — 404 Not Found** — user id does not exist

**Response — 422 Unprocessable Entity** — non-numeric id, empty patch body, or email already used by another user



---

### `DELETE /api/users/:id`

Removes the user with the given numeric ID. Returns no body on success.

**Response — 204 No Content**

```http
(empty body)
```

**Response — 404 Not Found** — user id does not exist

**Response — 422 Unprocessable Entity** — non-numeric id



## Configuration

| Variable | Default | Required | Description |
|----------|---------|----------|-------------|
| `PORT` | `3000` | No | Port the HTTP server listens on |