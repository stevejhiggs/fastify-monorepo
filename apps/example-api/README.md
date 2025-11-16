# Example API

A Fastify service that demonstrates the shared `@repo/fastify-base` utilities used across the monorepo. It ships with sample routes that cover health checks, schema validation, request-scoped logging, in-memory caching, and file uploads.

## Getting started

1. Install dependencies from the repository root: `pnpm install`.
2. Start the API (choose one):
   - `pnpm dev --filter example-api` – fastest way to run just this app with live reload.
   - `pnpm --filter example-api dev` from anywhere or `pnpm dev` inside `apps/example-api`.
3. The server listens on the `PORT` env var (default 3000, see `apps/example-api/src/listener.ts`). Visit `http://localhost:3000/health` to verify it is running.

Common scripts:

| Script | What it does |
| --- | --- |
| `pnpm --filter example-api build` | Builds the API using `tsdown`.
| `pnpm --filter example-api test` | Runs the Vitest suite.
| `pnpm --filter example-api lint` | Formats and lints the source with Biome.
| `pnpm --filter example-api typecheck` | Runs TypeScript in noEmit mode.

## Route reference

The routes are registered in `apps/example-api/src/routes/route-registry.ts`. Each sample route showcases a pattern you can mirror when adding new functionality.

| Method & Path | Purpose |
| --- | --- |
| `GET /health` | Returns `OK <uuid>` to confirm the service is healthy. Useful for probes and monitors. |
| `POST /schema-test/post/:par1/:par2` | Demonstrates rich Zod validation for body, query, params, headers, and responses. Echoes back validated values including the required `x-foo` header and `someOtherKey` from the body. |
| `GET /schema-test/get/:par1/:par2` | Shows inline schema definitions plus Zod ISO date parsing. Responds with the validated path params and `date` query string. |
| `GET /logging` | Invokes `logger.instance` from `@repo/fastify-base/logging` inside nested functions to illustrate request-scoped logging context. Response body is a simple `OK`. |
| `GET /caching` | Uses the shared `createInMemoryCache` helper with a 20s TTL and size limit. Returns a cached `{ uuid, timestamp }` pair and logs cache hits/misses. |
| `POST /files/upload` | Handles multipart form uploads with Zod validation. Accepts a single `image` field (PNG or JPEG up to 10 MB); echoes the uploaded file’s MIME type. |

## Adding new routes

1. Create a new folder under `src/routes/<your-route>` and export a `registerRoutes` function that accepts `EnhancedFastifyInstance`.
2. Import that function inside `src/routes/route-registry.ts` and call it in `registerRoutes`.
3. Add Zod schemas (`zod/v4`) for validation and response typing. This enables runtime validation plus compile-time types.
4. Update this README with a short note about the new route so others know what behavior is available.
