# Fastify Monorepo

A monorepo for building type-safe Fastify v5 APIs from composable, buildless TypeScript packages. No compilation in packages — raw `.ts` all the way through, assembled only at the application layer.

**Stack:** Fastify v5 / TypeScript Native (tsgo) / Zod v4 / pnpm workspaces / Turborepo / Vitest / oxlint + oxfmt

## Why This Exists

Setting up a Fastify API that's actually ready for production means wiring together validation, auth, logging, caching, rate limiting, OpenAPI docs, security headers, and observability. This monorepo provides all of those as independent, composable packages — use one, use some, or use them all.

Every package works standalone. Need just Zod validation and Swagger? Pull in `@repo/fastify-zod` and `@repo/fastify-swagger`. Want rate limiting without the rest? Use `@repo/fastify-rate-limit` on its own. Each plugin has no opinions about which others you pair it with.

If you want the full suite, `@repo/fastify-base` composes everything into a single function call:

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

This wires up Zod schema validation with full type inference, Swagger/OpenAPI docs at `/documentation`, structured request logging with correlation IDs, security headers via Helmet, multipart file uploads, rate limiting, and error handling decorators like `reply.notFound()` and `app.httpErrors.conflict()`.

## Quick Start

Requires Node.js v24+ and pnpm v10+.

```bash
git clone <repository-url>
cd fastify-monorepo
pnpm install
pnpm --filter example-api dev   # API at http://localhost:3000, docs at /documentation
```

## What's Included

### Fastify Plugins

Every plugin is a standalone package with its own entry point and no hard dependencies on the others. You can adopt them incrementally or use `@repo/fastify-base` to get them all at once.

| Package                        | What it does                                                     |
| ------------------------------ | ---------------------------------------------------------------- |
| `@repo/fastify-base`           | One-call server setup with all plugins pre-configured            |
| `@repo/fastify-zod`            | Zod v4 schema validation with compile-time type inference        |
| `@repo/fastify-swagger`        | Auto-generated OpenAPI docs from Zod schemas                     |
| `@repo/fastify-auth`           | Pluggable auth with support for multiple providers per app       |
| `@repo/fastify-auth-jwt`       | JWT bearer token authentication provider                         |
| `@repo/fastify-auth-firebase`  | Firebase authentication provider                                 |
| `@repo/fastify-observability`  | Request-scoped logging with correlation IDs and async context    |
| `@repo/fastify-rate-limit`     | Per-route or global rate limiting with Redis or in-memory stores |
| `@repo/fastify-security`       | Helmet security headers                                          |
| `@repo/fastify-multipart`      | File upload handling with MIME type and size validation          |
| `@repo/fastify-common-types`   | Shared TypeScript types across Fastify plugins                   |

### Infrastructure Packages

| Package                  | What it does                                                                |
| ------------------------ | --------------------------------------------------------------------------- |
| `@repo/caching`          | Two-tier cache (in-memory L1 + optional Redis) with SuperJSON serialization |
| `@repo/logging`          | Pino-based structured logging with optional GCP formatting                  |
| `@repo/open-telemetry`   | OpenTelemetry instrumentation for distributed tracing                       |
| `@repo/temporal`         | Logger adapter that bridges Temporal SDK events to pino                     |
| `@repo/typescript-utils` | Shared TypeScript utilities                                                 |

### No Build Step in Packages

None of the packages in this monorepo have a build step. They're written in native TypeScript and imported directly as `.ts` files — no compilation, no `dist` folders, no waiting for incremental builds to catch up. The TypeScript source *is* the package.

Only the final applications (`apps/`) compile anything, using `tsdown` to produce optimised production bundles. Everything upstream stays as raw TypeScript.

### Temporal Workflows

First-class support for [Temporal](https://temporal.io) durable workflows. Each Temporal app follows a three-package structure:

```
apps/<name>/
  api/                  # Fastify API that starts workflows
  worker/               # Temporal worker that executes them
  packages/workflows/   # Shared workflow and activity definitions
```

The shared workflows package is imported by both the API (for type-safe workflow execution) and the worker (for bundling). See `apps/temporal-example/` for a working reference.

## Commands

| Command                      | Description                                               |
| ---------------------------- | --------------------------------------------------------- |
| `pnpm dev`                   | Start all apps in development mode                        |
| `pnpm build`                 | Build all packages and apps                               |
| `pnpm test`                  | Run all tests                                             |
| `pnpm lint`                  | Lint and format all packages                              |
| `pnpm generate:package`      | Scaffold a new shared library                             |
| `pnpm generate:api`          | Scaffold a new Fastify API app                            |
| `pnpm generate:temporal-app` | Scaffold a Temporal app (API + worker + shared workflows) |
| `pnpm temporal:up`           | Start Temporal dev server (Docker)                        |
| `pnpm temporal:down`         | Stop Temporal dev server                                  |

## Generators

### New Package

```bash
pnpm generate:package
```

Creates a new shared library in `packages/` from the template with a `@repo/`-scoped `package.json`, shared `tsconfig.json`, and entry point. Turbo prompts for the name.

### New API

```bash
pnpm generate:api
```

Creates a fully configured Fastify app in `apps/` with `@repo/fastify-base` integration, example routes covering common patterns (validation, caching, rate limiting, file uploads, health checks), OpenTelemetry instrumentation, Vitest config, and production build setup.

### New Temporal App

```bash
pnpm generate:temporal-app
```

Creates three sub-packages under `apps/<name>/` (API, worker, shared workflows) and updates `pnpm-workspace.yaml` automatically.

After any generator, run `pnpm install` to link the new workspace packages.

## Project Structure

```
fastify-monorepo/
├── apps/
│   ├── example-api/              # Reference API application
│   └── temporal-example/         # Reference Temporal app
│       ├── api/                  # Fastify API with Temporal client
│       ├── worker/               # Temporal worker
│       └── packages/workflows/  # Shared workflow definitions
├── packages/
│   ├── caching/                  # In-memory and Redis caching
│   ├── logging/                  # Structured logging
│   ├── open-telemetry/           # OpenTelemetry instrumentation
│   ├── temporal/                 # Temporal worker utilities
│   ├── typescript-utils/         # Shared TypeScript utilities
│   └── fastify/                  # Fastify plugin suite
│       ├── fastify-base/         # Base setup (composes all plugins)
│       ├── fastify-zod/          # Zod validation provider
│       ├── fastify-swagger/      # OpenAPI documentation
│       ├── fastify-auth/         # Auth plugin (multi-provider)
│       ├── fastify-auth-jwt/     # JWT auth provider
│       ├── fastify-auth-firebase/# Firebase auth provider
│       ├── fastify-observability/# Request-scoped logging
│       ├── fastify-rate-limit/   # Rate limiting
│       ├── fastify-security/     # Security headers
│       ├── fastify-multipart/    # File upload support
│       └── fastify-common-types/ # Shared Fastify types
└── tooling/                      # Build configs and templates
```

## Docker

Build any app with the `TARGET_PACKAGE` build argument:

```bash
docker build --build-arg TARGET_PACKAGE=example-api -t example-api:latest .
```

## License

ISC
