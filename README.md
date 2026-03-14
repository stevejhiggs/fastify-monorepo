# Fastify Monorepo

A Fastify monorepo template for building scalable, type-safe APIs with modular architecture and buildless TypeScript support.

## Features

- Buildless TypeScript packages (no build step during development)
- Type-safe APIs with Zod schema validation
- Automatic Swagger/OpenAPI docs at `/documentation`
- Structured logging with optional GCP formatting
- In-memory caching with optional Redis
- Request-scoped logging
- Auth plugin system with multiple provider support (JWT, Firebase)
- Rate limiting with pluggable stores (in-memory or Redis)
- Sensible defaults for HTTP error handling (`reply.notFound()`, `app.httpErrors.conflict()`, etc.)
- OpenTelemetry instrumentation
- Turborepo for fast builds

**Stack:** Fastify v5, TypeScript Native (tsgo), Zod v4, pnpm, Turborepo, Vitest, oxlint + oxfmt

## Getting Started

**Prerequisites:** Node.js v24+, pnpm v10+

```bash
git clone <repository-url>
cd fastify-monorepo
pnpm install
pnpm dev  # API at http://localhost:3000, docs at /documentation
```

## Development

| Command                      | Description                            |
| ---------------------------- | -------------------------------------- |
| `pnpm dev`                   | Start all apps in development mode     |
| `pnpm build`                 | Build all packages and apps            |
| `pnpm test`                  | Run all tests                          |
| `pnpm lint`                  | Lint and format all packages           |
| `pnpm generate:package`      | Generate a new package from template   |
| `pnpm generate:api`          | Generate a new API app from template   |
| `pnpm generate:temporal-app` | Generate a Temporal app (API + worker) |
| `pnpm temporal:up`           | Start Temporal dev server (Docker)     |
| `pnpm temporal:down`         | Stop Temporal dev server               |

### Generating Packages

Scaffold a new shared library into `packages/`:

```bash
pnpm generate:package
```

This copies the template from `tooling/templates/package/`, which includes a minimal `package.json` (scoped to `@repo/`), a `tsconfig.json` extending the shared config, and a `src/index.ts` entry point. Turbo will prompt you for the new package name and destination.

### Generating APIs

Scaffold a new API application into `apps/`:

```bash
pnpm generate:api
```

This copies the template from `tooling/templates/api/`, which includes a fully configured Fastify app with:

- `@repo/fastify-base` integration with all plugins pre-wired
- Example routes (health check, schema validation, caching, rate limiting, logging, file upload, metrics)
- OpenTelemetry instrumentation setup
- Vitest configuration with coverage
- `tsdown` production build config
- Dev scripts with hot reload and `pino-pretty` log formatting

After generation, run `pnpm install` to link the new workspace package.

### Generating Temporal Apps

Scaffold a complete Temporal application with API, worker, and shared workflows package:

```bash
pnpm generate:temporal-app
```

This uses a custom Turborepo generator (defined in `turbo/generators/config.ts`) that prompts for a kebab-case name and creates three sub-packages under `apps/<name>/`:

- **`api/`** — Fastify API with a Temporal client and an example route that executes a workflow
- **`worker/`** — Temporal worker with structured logging via `@repo/temporal`
- **`packages/workflows/`** — Shared workflow and activity definitions (imported by both API and worker)

The generator also updates `pnpm-workspace.yaml` with the required workspace globs. After generation, run `pnpm install` to link everything.

**Environment Variables:**

- `LOG_LEVEL` - Logging level (default: `info`)
- `DISABLE_DOCS` - Disable `/documentation` endpoint (default: `false`)
- `REDIS_URL` - Optional Redis connection URL
- `PORT` - Server port (default: `3000`)
- `TEMPORAL_ADDRESS` - Temporal server address (default: `localhost:7233`)

## Project Structure

```
fastify-monorepo/
├── apps/
│   ├── example-api/           # Example API application
│   └── temporal-example/      # Example Temporal app
│       ├── api/               # Fastify API with Temporal client
│       ├── worker/            # Temporal worker
│       └── packages/workflows/ # Shared workflow definitions
├── packages/
│   ├── caching/               # In-memory and Redis caching
│   ├── logging/               # Pino-based structured logging
│   ├── open-telemetry/        # OpenTelemetry instrumentation
│   ├── temporal/              # Temporal worker utilities
│   ├── typescript-utils/      # Shared TypeScript utilities
│   └── fastify/
│       ├── fastify-auth/          # Auth plugin (multi-provider)
│       ├── fastify-auth-jwt/      # JWT auth provider
│       ├── fastify-auth-firebase/ # Firebase auth provider
│       ├── fastify-base/          # Base Fastify setup with all plugins
│       ├── fastify-common-types/  # Shared Fastify types
│       ├── fastify-multipart/     # File upload support
│       ├── fastify-observability/ # Request-scoped logging
│       ├── fastify-rate-limit/    # Rate limiting
│       ├── fastify-security/      # Helmet security headers
│       ├── fastify-swagger/       # OpenAPI documentation
│       └── fastify-zod/           # Zod validation provider
└── tooling/                   # Shared configs and templates
```

### `@repo/fastify-base`

Production-ready Fastify instance with all plugins configured:

```typescript
import { setupBaseApp } from '@repo/fastify-base';

const { app } = await setupBaseApp({
  port: 3000,
  serviceInfo: { name: 'My API', version: '1.0.0' },
  logger: { logLevel: 'info' },
  swagger: { enable: true },
  rateLimit: { max: 100, timeWindow: '1 minute' }
});
```

## Docker

Build an app using the `TARGET_PACKAGE` build argument:

```bash
docker build --build-arg TARGET_PACKAGE=example-api -t example-api:latest .
```

## Testing

Tests are co-located with source files using Vitest:

```bash
pnpm test
pnpm test --coverage
```

## Code Quality

Uses oxlint (linter) and oxfmt (formatter) with lint-staged for automatic formatting on commit. TypeScript strict mode is enforced everywhere via tsgo (TypeScript Native).

## Architecture

Buildless development: packages use TypeScript directly without a build step. Production builds use `tsdown` for optimized output.

## License

ISC
