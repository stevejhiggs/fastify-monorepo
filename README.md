# Fastify Monorepo

A Fastify monorepo template for building scalable, type-safe APIs with modular architecture and buildless TypeScript support.

## 🚀 Features

- Buildless TypeScript packages (no build step during development)
- Type-safe APIs with Zod schema validation
- Automatic Swagger/OpenAPI docs at `/documentation`
- Structured logging with optional GCP formatting
- In-memory caching with optional Redis
- Request-scoped logging
- Turborepo for fast builds

**Stack:** Fastify, TypeScript, Zod, pnpm, Turborepo, Vitest, Biome

## 🏁 Getting Started

**Prerequisites:** Node.js v24+, pnpm v10.24.0+

```bash
git clone <repository-url>
cd fastify-monorepo
pnpm install
pnpm dev  # API at http://localhost:3000, docs at /documentation
```

## 🛠️ Development

| Command                 | Description                          |
| ----------------------- | ------------------------------------ |
| `pnpm dev`              | Start all apps in development mode   |
| `pnpm build`            | Build all packages and apps          |
| `pnpm test`             | Run all tests                        |
| `pnpm typecheck`        | Type check all packages              |
| `pnpm lint`             | Lint all packages                    |
| `pnpm generate:package` | Generate a new package from template |

**Environment Variables:**

- `LOG_LEVEL` - Logging level (default: `info`)
- `DISABLE_DOCS` - Disable `/documentation` endpoint (default: `false`)
- `REDIS_URL` - Optional Redis connection URL

## 📁 Project Structure

```
fastify-monorepo/
├── apps/example-api/          # Example API application
├── packages/
│   ├── caching/               # Caching utilities
│   ├── logging/               # Logging utilities
│   ├── open-telemetry/        # OpenTelemetry instrumentation
│   ├── typescript-utils/      # Shared TypeScript utilities
│   └── fastify/
│       ├── fastify-base/      # Base Fastify setup with all plugins
│       ├── fastify-common-types/
│       ├── fastify-multipart/
│       ├── fastify-observability/
│       ├── fastify-security/
│       ├── fastify-swagger/
│       └── fastify-zod/
└── tooling/                   # Shared configs and templates
```

### `@repo/fastify-base`

Production-ready Fastify instance with all plugins configured:

```typescript
import { setupBaseApp } from '@repo/fastify-base';

const { app } = await setupBaseApp({
  port: 3000,
  logger: { logLevel: 'info' },
  swagger: { enable: true, title: 'My API', version: '1.0.0' }
});
```

## 🐳 Docker

Build an app using the `TARGET_PACKAGE` build argument:

```bash
docker build --build-arg TARGET_PACKAGE=example-api -t example-api:latest .
```

## 🧪 Testing

Tests are co-located with source files using Vitest:

```bash
pnpm test
pnpm test --coverage
```

## 📝 Code Quality

Uses Biome (formatter/linter), TypeScript strict mode, Husky, and lint-staged. Code is automatically formatted and linted on commit.

## 🏗️ Architecture

Buildless development: packages use TypeScript directly without a build step. Production builds use `tsdown` for optimized output.

## 🗺️ Roadmap

- [ ] OpenTelemetry support
- [ ] Authentication/Authorization
- [ ] GitHub Actions CI/CD
- [ ] API generation from templates
- [ ] Rate limiting

## 📄 License

ISC
