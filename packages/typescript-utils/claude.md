# @repo/typescript-utils

Shared TypeScript utility types used across the monorepo.

## Exports

```typescript
import type { ObjectValues } from '@repo/typescript-utils/types';
```

## Current Types

- `ObjectValues<T>` — extracts the value union from a `const` object (the preferred alternative to TypeScript `enum`)

## Adding Types

When adding new utility types:

1. Add to `src/types.ts`
2. Export from `./types` subpath
3. Only add types used by multiple packages
4. Prefer built-in TypeScript utilities when possible
