# Architecture Decision Records

> This file is append-only. Past entries must never be edited or deleted.

---

## ADR-001: TypeScript with ESM (`"type": "module"`)

**Date:** 2026-05-18
**Status:** Accepted
**Plan:** preplan-hono-scaffold.md

### Context
The project requires a strongly-typed Node.js runtime. JavaScript ESM (`import`/`export`) is the modern module system and the direction Node.js is standardising on. CommonJS (`require`) is legacy and cannot consume native ESM packages without compatibility shims.

### Decision
All source files are written in TypeScript compiled to ESM. `package.json` sets `"type": "module"` and `tsconfig.json` uses `"module": "NodeNext"` with `"moduleResolution": "NodeNext"` to align TypeScript's resolution algorithm with Node's native ESM loader.

### Consequences
- All imports must include explicit file extensions (`.js`) when referencing local modules.
- `require()` and CommonJS interop patterns are not available.
- Any dependency that ships CJS-only must be evaluated for compatibility before adoption.

---

## ADR-002: Hono as the HTTP Framework

**Date:** 2026-05-18
**Status:** Accepted
**Plan:** preplan-hono-scaffold.md

### Context
The project needs a lightweight, type-safe HTTP framework for Node.js. Express is the incumbent but has limited TypeScript support and no first-class ESM story. Fastify is feature-rich but heavyweight for a greenfield API. Hono is built for edge and server runtimes, is fully ESM-native, and provides excellent TypeScript inference on route handlers.

### Decision
Hono is used as the HTTP framework, served via `@hono/node-server` for the Node.js adapter. The `Hono` class is instantiated once and routes are registered directly on it.

### Consequences
- Route handler types are inferred automatically, removing the need for manual `Request`/`Response` type annotations.
- The `@hono/node-server` adapter introduces a thin wrapper — raw `http.IncomingMessage` is not directly accessible without a middleware shim.
- Migrating to an edge runtime (e.g., Cloudflare Workers) requires only swapping the server adapter, not the application code.

---

## ADR-003: Hexagonal (Ports & Adapters) Architecture

**Date:** 2026-05-18
**Status:** Accepted
**Plan:** preplan-hono-scaffold.md

### Context
The project is a User Management API where business rules (auth, RBAC, user lifecycle) must remain independent of delivery mechanisms (HTTP) and infrastructure concerns (database, password hashing). Without enforced layer separation, business logic tends to leak into controllers and persistence code over time.

### Decision
The source tree is structured as five hexagonal layers: `domain/` (entities and port interfaces), `application/` (use cases), `adapters/` (HTTP controllers, validators, persistence implementations), `infrastructure/` (app bootstrap, DB wiring), and `shared/` (cross-cutting utilities like the JSON:API serialiser and error types). No framework or infrastructure import is allowed inside `domain/` or `application/`.

### Consequences
- Use cases are testable in isolation by injecting mock port implementations — no HTTP or database setup required in unit tests.
- Adding a new delivery mechanism (e.g., gRPC, CLI) requires only a new adapter, not changes to business logic.
- The strict import boundary requires discipline; violations will not be caught automatically without a lint rule enforcing them.

---

## ADR-004: JSON:API Response Format

**Date:** 2026-05-18
**Status:** Accepted
**Plan:** preplan-hono-scaffold.md

### Context
APIs that grow over time often develop inconsistent response shapes across endpoints. A standardised response format reduces client-side parsing complexity and makes error handling predictable.

### Decision
All API responses — including the `/health` endpoint — use `Content-Type: application/vnd.api+json`. Response bodies follow the JSON:API specification structure (e.g., `{"meta":{"status":"ok"}}` for meta-only responses).

### Consequences
- Clients must send `Accept: application/vnd.api+json` or accept the content type unconditionally.
- A shared JSON:API serialiser utility must be maintained in `src/shared/` as the API grows.
- Deviating from JSON:API in any new endpoint is explicitly disallowed by project standards.

---

## ADR-006: `dotenv` for Environment Variable Loading

**Date:** 2026-05-18
**Status:** Accepted
**Plan:** preplan-dotenv-setup.md

### Context
Configuration values such as the server port must not be hardcoded in source files. They need to be injectable at runtime via environment variables, and the local development environment needs a convenient way to supply them without exporting variables manually in each shell session.

### Decision
The `dotenv` npm package is installed as a runtime dependency. It is loaded via `import 'dotenv/config'` at the top of `src/index.ts`, which reads `app/.env` and populates `process.env` before any other code runs. An `app/.env.example` file is committed to the repository as the canonical reference for all required environment variables. The actual `app/.env` is excluded from git via `app/.gitignore`.

### Consequences
- Developers must copy `.env.example` to `.env` and fill in their local values when setting up the project.
- `process.env.PORT` (and future env vars) are available throughout the application after the import.
- `.env` must never be committed — it is enforced by `app/.gitignore`.
- Any new required environment variable must be documented in `.env.example` before use.

---

## ADR-005: `tsx watch` as the Development Runner

**Date:** 2026-05-18
**Status:** Accepted
**Plan:** preplan-hono-scaffold.md

### Context
TypeScript source cannot be executed by Node.js directly. A dev-time runner is needed that transpiles on the fly and restarts on file changes. Options considered: `ts-node` (slow, CJS-first), `nodemon` + `ts-node` (two tools, configuration overhead), `tsx` (fast esbuild-based transpiler with a built-in `watch` mode).

### Decision
`tsx watch src/index.ts` is used as the `dev` npm script. `tsx` handles TypeScript transpilation via esbuild and `watch` provides hot-reload without additional tooling.

### Consequences
- No compilation step is required during development — changes are reflected immediately.
- `tsx` transpiles without type-checking; type errors are only caught by running `tsc --noEmit` explicitly.
- `ts-node` and `nodemon` are not permitted as alternatives (plan anti-pattern constraint).

---

## ADR-006: Remove `src/` Subdirectory — Source Root at `app/`

**Date:** 2026-05-18
**Status:** Accepted
**Plan:** preplan-move-src-to-app-root.md

### Context
The project initially placed all TypeScript source under `app/src/`. With `app/` already being a dedicated application container (alongside `node_modules`, `package.json`, `tsconfig.json`), the extra `src/` nesting added no meaningful separation and created redundant path depth in every import, script, and config reference.

### Decision
All source directories (`adapters/`, `application/`, `domain/`, `infrastructure/`, `shared/`) and `index.ts` are moved directly into `app/`. `tsconfig.json` is updated to `rootDir: "."` with an explicit `include` list covering only the source directories. `package.json` `dev` script is updated from `tsx watch src/index.ts` to `tsx watch index.ts`.

### Consequences
- Source paths are one level shorter across all tooling, configs, and scripts.
- `tsconfig.json` `include` must be kept in sync if new top-level source directories are added.
- `tsx watch src/index.ts` is no longer valid — all references to `src/` in scripts or docs must use the root-relative path.

---

## ADR-009: Repository Root Restructure — Config at Root, Source in `src/`

**Date:** 2026-05-19
**Status:** Accepted
**Plan:** preplan-restructure-to-root.md

### Context
All tooling and configuration files (`package.json`, `tsconfig.json`, `eslint.config.js`, Dockerfile, Husky, Prettier, etc.) were nested inside an `app/` subdirectory. This required workarounds in several places: the `prepare` script navigated with `cd ..`, the `docker-compose.yml` build context pointed to `./app`, and developers had to `cd app` before running any npm command. The layout was non-standard and added friction to every developer workflow.

### Decision
All configuration and tooling files are moved to the repository root. The TypeScript source tree (`adapters/`, `application/`, `domain/`, `infrastructure/`, `shared/`, `index.ts`) is moved into a new `src/` directory at the root. `tsconfig.json` is updated to `rootDir: "src"` and `include: ["src"]`. The `dev` script is updated to `tsx watch src/index.ts`. `docker-compose.yml` build context is updated to `.`. The `.husky/pre-push` hook is introduced with `npm test`; `pre-commit` is updated to `npx lint-staged`. The `app/` directory is fully deleted.

### Consequences
- All npm commands run from the repository root — no subdirectory navigation required.
- `docker compose up --build` builds from the repo root context.
- `.env`, `node_modules/`, and `dist/` are gitignored at the root level.
- Pre-commit runs lint-staged; pre-push runs `npm test` (hooks are active after `npm install`).
- ADR-006 (dotenv) and ADR-008 (Docker Compose) references to `app/.env` and `./app` paths are superseded by this restructure — the canonical paths are now `.env` and `.` respectively.

---



**Date:** 2026-05-19
**Status:** Accepted
**Plan:** preplan-docker-setup.md

### Context
The app needs to be containerised for consistent deployment. A single-stage build would include TypeScript, tsx, and all devDependencies in the production image, increasing image size and attack surface.

### Decision
A two-stage Dockerfile is used. The `builder` stage installs all dependencies and compiles TypeScript via `npm run build`. The `production` stage starts fresh from `node:24-alpine`, installs only production dependencies (`npm ci --omit=dev`), and copies only the compiled `dist/` output. `node:24-alpine` is chosen to match the Node.js version used in development and to minimise image size.

### Consequences
- Production image contains no TypeScript source, no devDependencies, and no `tsx` transpiler.
- Image size is significantly smaller than a single-stage build.
- `npm run build` must succeed before the image can be built — a broken TypeScript compilation will fail the build explicitly.

---

## ADR-013: Flat JSON:API-Inspired Response Shape for User Resources

**Date:** 2026-05-19
**Status:** Accepted
**Plan:** preplan-json-api-response-shape.md

### Context
The initial `GET /api/users` response used the strict JSON:API resource object structure — `{ data: [{ type, id, attributes: { ... } }] }`. This adds nesting that clients must traverse (`item.attributes.name`) and a `type` field that adds no information for single-resource APIs. The team decided a simpler, flatter shape is more ergonomic while retaining the `data` wrapper convention and the `application/vnd.api+json` content type.

### Decision
User resource responses use a flat shape inside the `data` array: `{ data: [{ id, name, email, role, accessToken }] }`. The `type` and `attributes` envelope are dropped. The numeric `id` is coerced to a string in the response. The `data` field is always an array, even for single-resource responses. The `Content-Type: application/vnd.api+json` header is retained. This replaces the format described in ADR-004 for user resource responses specifically.

### Consequences
- Clients access fields directly (`item.name`, `item.role`) rather than via `item.attributes.name`.
- The response is no longer compliant with the strict JSON:API specification, but retains the `data` wrapper and content type for future extensibility.
- All future user-facing endpoints must follow this flat shape for consistency.
- The `type` field must never re-appear in user resource responses.

---



**Date:** 2026-05-19
**Status:** Accepted
**Plan:** preplan-list-users.md

### Context
The project needed a unit testing framework compatible with ESM, TypeScript, and the Vite/modern toolchain. Jest requires additional configuration for ESM support. Vitest is ESM-native, requires zero configuration for TypeScript projects, and integrates naturally with the existing toolchain.

### Decision
Vitest is installed as a dev dependency. The `test` script in `package.json` is set to `vitest run`. Unit tests live alongside their source files (e.g., `ListUsersUseCase.test.ts` next to `ListUsersUseCase.ts`).

### Consequences
- Tests run without a Babel or Jest transform configuration.
- Test files are co-located with source, keeping them easy to discover and maintain.
- `npm test` (and the pre-push Husky hook) now runs the full Vitest suite.

---

## ADR-011: Hardcoded In-Memory Seed Data in ListUsersUseCase

**Date:** 2026-05-19
**Status:** Accepted
**Plan:** preplan-list-users.md

### Context
The `GET /api/users` endpoint was the first use case implemented. No database or repository port exists yet. The plan explicitly deferred persistence to a future phase.

### Decision
`ListUsersUseCase` holds a private instance array of 3 hardcoded `User` objects as seed data. The array is instance-level (not static) to ensure test isolation. The use case maps `User[]` to `UserView[]` before returning so the domain entity is never exposed to the adapter layer.

### Consequences
- The endpoint returns the same 3 users on every call until a persistence layer is wired.
- Replacing the seed with a real repository requires changing only `ListUsersUseCase` — the handler and its test are unaffected.
- Static shared state across test instances is explicitly avoided by using instance-level arrays.

---

## ADR-012: Replace IUser with UserView — Correct Port Semantics

**Date:** 2026-05-19
**Status:** Accepted
**Plan:** preplan-remove-iuser.md

### Context
`IUser` was placed in `src/application/ports/` as if it were a hexagonal port, but it is not. A port is a contract at the boundary between the application core and the outside world. `IUser` was an internal interface mirroring the `User` entity's getter methods — both sides of the interface live inside the hexagon. It crossed no boundary.

### Decision
`IUser` is deleted. A `UserView` plain type alias is introduced at `src/application/ports/UserView.ts` as the true output DTO: the shape that use cases produce when handing data outward to adapters. `ListUsersUseCase.execute()` maps `User[]` → `UserView[]` internally. `ListUsersHandler` types against `UserView` and accesses all fields as plain properties, with no knowledge of the `User` entity.

### Consequences
- `password` can never leak to adapters — it is structurally absent from `UserView`.
- Adapters depend on a stable plain-object shape, not on domain entity methods — changing getter names in `User` does not ripple into handlers.
- The mapping responsibility is owned by the use case, consistent with the hexagonal rule that the application core controls what crosses the outward boundary.

---



**Date:** 2026-05-19
**Status:** Accepted
**Plan:** preplan-docker-setup.md

### Context
Developers need a way to run the containerised app locally without manually constructing `docker build` and `docker run` commands. Environment variables must not be hardcoded in version-controlled files.

### Decision
A `docker-compose.yml` is placed at the repository root. It defines a single `app` service with `build.context: ./app`, port mapping `3000:3000`, and `env_file: ./app/.env`. The `.env` file is created manually by each developer from `.env.example` before running. No `restart` policy is set (development convenience only). No database or other services are included.

### Consequences
- `docker compose up --build` is the single command to build and start the app locally.
- Secrets and environment values are never hardcoded in the Compose file.
- Adding a database service in future requires a separate Compose file or an extension of this one.

---

## ADR-013: In-Memory User Repository via IUserRepository Port

**Date:** 2026-05-19
**Status:** Accepted
**Plan:** preplan-in-memory-user-repository.md

### Context
`ListUsersUseCase` previously held a hardcoded `User[]` array directly inside the class. This violated the hexagonal architecture principle that use cases should depend on abstractions (ports), not on data sources. It also made the use case untestable without executing against fixed data.

### Decision
A `IUserRepository` port interface is introduced in `src/application/ports/` with a single `findAll(): Promise<User[]>` method. `ListUsersUseCase` now receives an `IUserRepository` via constructor injection and calls `findAll()` asynchronously. A concrete `InMemoryUserRepository` adapter in `src/adapters/persistence/` seeds three users in its constructor and implements the port. Wiring happens in `src/index.ts`.

### Consequences
- Use cases are fully decoupled from data sources and are testable with mock repositories.
- Swapping the in-memory adapter for a real DB adapter requires only changing the wiring in `src/index.ts`.
- `execute()` is now async; any caller (e.g. HTTP handlers) must `await` it.
- The `IUserRepository` port can be extended with additional methods (e.g. `findById`, `save`) as new use cases require them.

---
