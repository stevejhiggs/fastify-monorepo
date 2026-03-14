# @repo/temporal

Shared utilities for Temporal workers in this monorepo.

## Exports

```typescript
import { createTemporalLogger } from '@repo/temporal';
```

## Logger Adapter

Adapts a pino logger from `@repo/logging` to Temporal's `Logger` interface, so all Temporal SDK logs (activity failures, workflow task errors, connection issues) flow through structured pino logging.

```typescript
import { initLogger } from '@repo/logging';
import { createTemporalLogger } from '@repo/temporal';
import { Runtime } from '@temporalio/worker';

const logger = initLogger({ logLevel: 'info' });

Runtime.install({
  logger: createTemporalLogger(logger)
});
```

This must be called before `Worker.create()` — `Runtime.install()` is a singleton that configures the Temporal SDK globally.

## Why This Exists

Temporal's `Logger` interface uses `(message, meta?)` argument order while pino uses `(meta, message)`. This adapter bridges the two and maps Temporal's uppercase log levels (`TRACE`, `DEBUG`, `INFO`, `WARN`, `ERROR`) to pino's lowercase equivalents.
