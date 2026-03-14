# @repo/typescript-config

Shared TypeScript configuration for the monorepo.

## Usage

Extend in package `tsconfig.json`:

```json
{
  "extends": "@repo/typescript-config/tsconfig.base.json",
  "compilerOptions": {
    "outDir": ".dist",
    "rootDir": "src"
  },
  "include": ["src"]
}
```

## Key Settings

The base config enforces strict TypeScript:

```json
{
  "module": "preserve",
  "moduleResolution": "bundler",
  "target": "ES2024",
  "strict": true,
  "noUncheckedIndexedAccess": true,
  "verbatimModuleSyntax": true,
  "noUnusedLocals": true,
  "noUnusedParameters": true,
  "erasableSyntaxOnly": true
}
```

## Key Behaviors

### `verbatimModuleSyntax`

Requires explicit `import type` for type-only imports:

```typescript
import type { User } from './types.ts'; // Correct
import { User } from './types.ts'; // Error if User is type-only
```

### `noUncheckedIndexedAccess`

Array/object index access may be undefined:

```typescript
const arr = [1, 2, 3];
const val = arr[0]; // type: number | undefined
```

### `erasableSyntaxOnly`

Only TypeScript syntax that can be erased is allowed (no enums with computed values, etc.).

## Path Aliases

Each package defines its own path aliases in its tsconfig:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Modifying

Changes here affect all packages. Test thoroughly.
