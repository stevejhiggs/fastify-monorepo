# Fastify Monorepo

Production-ready Fastify v5 monorepo with modular plugins for building type-safe, observable APIs.

## Tech Stack

- **Runtime**: Node.js 24+ with native ES modules
- **Framework**: Fastify v5.6
- **Language**: TypeScript Native 7.0 (tsgo - strict mode)
- **Validation**: Zod v4 with type providers
- **Package Manager**: pnpm 10.25 with workspaces
- **Build**: Turborepo for orchestration, tsdown for production builds
- **Testing**: Vitest
- **Linting**: oxlint + oxfmt (with type-aware linting)

## Architecture

### Buildless Development

This repo uses a **buildless development** approach:

- TypeScript runs directly via `tsx` during development
- No compilation step needed for local dev
- Production builds use `tsdown` for optimization

### Package Structure

```
apps/           → Runnable applications
packages/       → Shared libraries
  fastify/      → Fastify plugins (modular)
  temporal/     → Temporal worker utilities (@repo/temporal)
tooling/        → Build configuration
```

### Temporal App Pattern

Temporal apps live under `apps/<name>/` with three sub-packages:

```
apps/<name>/
  api/                  → Fastify API that starts workflows
  worker/               → Temporal worker that executes workflows
  packages/workflows/   → Shared workflow & activity definitions
```

The shared workflows package is imported by both the API (for type-safe `client.workflow.execute()`) and the worker (for `workflowsPath` bundling). See `apps/temporal-example/` for a working reference.

### Fastify Plugin Pattern

Fastify packages follow a registration pattern that returns typed instances:

```typescript
import { setupBaseApp } from '@repo/fastify-base';

const app = await setupBaseApp({
  logger: { level: 'info' },
  swagger: { title: 'My API' }
});
```

Plugins can be composed: `registerZod(registerSecurity(app))`

## Key Conventions

### File Naming

- Use **kebab-case** for all files (enforced by oxlint)
- Tests co-located: `foo.ts` → `foo.test.ts`

### Imports

- Workspace packages use `@repo/` prefix
- Use explicit `.ts` extensions for relative imports

### TypeScript

- Strict mode enabled everywhere
- No `any` types - use `unknown` and narrow
- `noUncheckedIndexedAccess: true` - handle undefined array access
- `verbatimModuleSyntax: true` - use `import type` for type-only imports

### Exports

- Each package defines explicit `exports` in package.json
- Prefer subpath exports over deep imports

## Common Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Run all apps in watch mode
pnpm test             # Run tests
pnpm typecheck        # Type check with tsgo (TypeScript Native)
pnpm lint             # Lint with oxlint and format with oxfmt
pnpm build            # Production build
```

## Environment Variables

- `LOG_LEVEL` - Logger severity (default: `info`)
- `REDIS_URL` - Redis connection for distributed caching
- `PORT` - Server port (default: `3000`)
- `DISABLE_DOCS` - Disable Swagger docs endpoint
- `TEMPORAL_ADDRESS` - Temporal server address (default: `localhost:7233`)

## Adding New Packages

Use the generators:

- `pnpm generate:package` — new shared library package
- `pnpm generate:api` — new Fastify API application
- `pnpm generate:temporal-app` — new Temporal app (API + worker + shared workflows)

Or manually:

1. Create directory in appropriate location
2. Add `package.json` with `@repo/` scoped name
3. Extend `@repo/typescript-config` in tsconfig.json
4. Add to appropriate workspace in pnpm-workspace.yaml

## Testing

- Vitest for unit tests
- Tests use shared config from `@repo/vitest`
- Run single package: `pnpm --filter @repo/package-name test`
- Coverage: `pnpm test -- --coverage`

## Docker

Build any app with:

```bash
docker build --build-arg TARGET_PACKAGE=example-api -t example-api:latest .
```

See [docs/docker.md](docs/docker.md) for details on how the build pipeline works.
