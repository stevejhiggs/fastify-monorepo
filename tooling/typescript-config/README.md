# @repo/typescript-config

Shared TypeScript base configuration for the monorepo. Provides consistent, strict TypeScript settings across all packages.

## Features

- **Strict Type Checking** - Maximum type safety with strict mode enabled
- **Modern ES2024** - Latest JavaScript features and libraries
- **Buildless Support** - Configuration optimized for buildless TypeScript
- **Incremental Compilation** - Fast type checking with incremental builds
- **Consistent Settings** - Same configuration across all packages

## Installation

This package is typically used as a workspace dependency and doesn't need to be installed separately. It's referenced in `tsconfig.json` files via `extends`.

## Usage

### Basic Setup

Create a `tsconfig.json` file in your package:

```json
{
  "extends": "@repo/typescript-config/tsconfig.base",
  "include": ["./src/**/*.ts"],
  "exclude": ["**/node_modules", "**/.*/"]
}
```

### With Custom Options

You can extend and override settings:

```json
{
  "extends": "@repo/typescript-config/tsconfig.base",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["./src/**/*.ts"]
}
```

### For JavaScript Files

If your package includes JavaScript files:

```json
{
  "extends": "@repo/typescript-config/tsconfig.base",
  "compilerOptions": {
    "allowJs": true
  },
  "include": ["./src/**/*.{ts,js}"]
}
```

## Example: Package TypeScript Config

```json
{
  "extends": "@repo/typescript-config/tsconfig.base",
  "include": ["./src/**/*.ts"],
  "exclude": ["**/node_modules", "**/.*/", "**/*.test.ts"]
}
```

## Example: App TypeScript Config

```json
{
  "extends": "@repo/typescript-config/tsconfig.base",
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  },
  "include": ["./src/**/*.ts"],
  "exclude": ["**/node_modules", "**/.*/"]
}
```

## Benefits

### Consistency

All packages use the same TypeScript configuration, ensuring:
- Consistent type checking behavior
- Same language features available everywhere
- Predictable compilation results

### Type Safety

Strict settings catch more errors at compile time:
- Unused variables and parameters
- Unsafe index access
- Missing type annotations

### Performance

Incremental compilation and composite projects enable:
- Faster type checking
- Better IDE performance
- Efficient monorepo builds

## Migration

If you're adding this to an existing package:

1. Create or update `tsconfig.json`:
   ```json
   {
     "extends": "@repo/typescript-config/tsconfig.base",
     "include": ["./src/**/*.ts"]
   }
   ```

2. Run type checking:
   ```bash
   pnpm typecheck
   ```

3. Fix any new type errors (the strict settings may reveal issues)

## Testing

This package doesn't have tests as it's a configuration file. Verify it works by running:

```bash
pnpm typecheck
```

in any package that uses it.

## License

ISC

