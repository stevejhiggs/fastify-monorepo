# @repo/typescript-utils

Shared TypeScript utility types for the monorepo. Use instead of duplicating common type patterns across packages.

## Usage

### `ObjectValues<T>` — const enum helper

The primary use case is extracting the value union from a `const` object, the TypeScript-native alternative to `enum`:

```typescript
import type { ObjectValues } from '@repo/typescript-utils/types';

const Direction = {
  Up: 'UP',
  Down: 'DOWN',
  Left: 'LEFT',
  Right: 'RIGHT'
} as const;

type Direction = ObjectValues<typeof Direction>;
// => 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'
```

## Exports

```typescript
// Utility types
import type { ObjectValues } from '@repo/typescript-utils/types';
```
