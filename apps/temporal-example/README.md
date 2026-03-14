# temporal-example

A Temporal application with an API, worker, and shared workflows package.

## Structure

```
temporal-example/
├── api/                    # Fastify API that starts workflows
├── worker/                 # Temporal worker that executes workflows
└── packages/workflows/     # Shared workflow & activity definitions
```

## Getting started

**Prerequisites:** A running Temporal server (`temporal server start-dev`)

1. Install dependencies from the repository root: `pnpm install`
2. Start the worker and API (from the repository root):
   ```bash
   pnpm --filter @repo/temporal-example-worker dev
   pnpm --filter @repo/temporal-example-api dev
   ```
3. The API listens on port 3000 by default. Visit `http://localhost:3000/health` to verify.

## Environment Variables

- `LOG_LEVEL` - Logger level (default: `info`)
- `PORT` - API server port (default: `3000`)
- `TEMPORAL_ADDRESS` - Temporal server address (default: `localhost:7233`)
- `DISABLE_DOCS` - Disable Swagger docs endpoint
