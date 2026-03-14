# Docker

The monorepo uses a single multi-stage `Dockerfile` at the repository root to build any application (APIs and Temporal workers).

## Building an image

```bash
docker build --build-arg TARGET_PACKAGE=example-api -t example-api:latest .
```

`TARGET_PACKAGE` must match the `name` field in the target app's `package.json`.

## How it works

1. **Prepare** — Turbo prunes the monorepo into an isolated sub-workspace for the target package.
2. **Prod deps** — Installs only production dependencies with `--shamefully-hoist`.
3. **Build** — Installs all dependencies, copies source, and runs `tsdown` (output goes to `.dist/`).
4. **Final image** — Copies the built output and production `node_modules` into a minimal `node:24-trixie-slim` image.

The final `CMD` is:

```dockerfile
CMD [ "node", "./index.mjs" ]
```

`--enable-source-maps` is set via `NODE_OPTIONS` in the Dockerfile by default.

## Customising startup with `NODE_OPTIONS`

The Dockerfile sets a default `NODE_OPTIONS="--enable-source-maps"`. To add extra Node flags at deploy time (e.g. OpenTelemetry instrumentation), override `NODE_OPTIONS` in your deployment configuration:

```yaml
# docker-compose example
environment:
  NODE_OPTIONS: "--enable-source-maps --import ./telemetry.mjs"
```

```yaml
# Kubernetes example
env:
  - name: NODE_OPTIONS
    value: "--enable-source-maps --import ./telemetry.mjs"
```

This is how API services opt into telemetry without changing the base image. Temporal workers typically don't need the `--import` flag and can use the default `NODE_OPTIONS`.
