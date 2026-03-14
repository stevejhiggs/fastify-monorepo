# Docker Builds

A single root `Dockerfile` builds any app in the monorepo. It uses [`turbo prune --docker`](https://turborepo.dev/docs/reference/prune) to generate a minimal build context containing only the target package and its dependencies.

## Build any app

```bash
docker build --build-arg TARGET_PACKAGE=example-api -t example-api:latest .
```

## How it works

The build uses a multi-stage pipeline:

```
┌─────────┐     ┌───────────┐     ┌─────────┐
│ prepare  │────>│ prod-deps │────>│  final  │
│          │     └───────────┘     │         │
│          │────>┌───────────┐────>│         │
│          │     │   build   │     └─────────┘
└──────────┘     └───────────┘
```

1. **base** - Sets up Node.js, enables pnpm via corepack
2. **prepare** - Copies the full repo and runs `turbo prune ${TARGET_PACKAGE} --docker`, which outputs:
   - `out/json/` - `package.json` files and pruned lockfile (just the dependency graph)
   - `out/full/` - Full source code for the target package and its workspace dependencies
3. **prod-deps** - Installs only production dependencies from the pruned lockfile
4. **build** - Installs all dependencies, copies full source, runs `tsdown` to produce bundled ESM output in `.dist/`
5. **final** - Copies `.dist/` output and production `node_modules` into a clean image

## tsdown bundling strategy

Apps use `tsdown` to bundle internal `@repo/*` workspace packages into the output while keeping all third-party dependencies external (resolved from `node_modules` at runtime).

This is configured in each app's `tsdown.config.ts`:

```typescript
deps: {
  alwaysBundle: [/^@repo\//],
  neverBundle: (id) => !id.startsWith('@repo/') && !id.startsWith('.') && !id.startsWith('/')
}
```

- `alwaysBundle` - Inlines all `@repo/*` workspace code into the output
- `neverBundle` - Ensures all third-party dependencies (including transitive ones from `@repo/*` packages) stay external

This prevents CJS/ESM interop issues with packages that use `__dirname` or other CJS-only features, which break when bundled into ESM output.

## Adding Docker support to a new app

1. Add a `tsdown.config.ts` with the bundling configuration (see `apps/example-api/tsdown.config.ts` for reference)
2. Build from the repo root:
   ```bash
   docker build --build-arg TARGET_PACKAGE=your-app -t your-app:latest .
   ```
3. No app-level `Dockerfile` is needed - the root Dockerfile handles all apps

## Running

```bash
docker run -p 3000:3000 example-api:latest
```

The container runs as a non-root `node` user, exposes port 3000, and loads OpenTelemetry instrumentation via `--import ./telemetry.mjs` before starting the app.
