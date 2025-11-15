# @repo/vitest

Shared Vitest configuration for the monorepo. Provides consistent test setup across all packages with TypeScript path resolution and sensible defaults.

## Features

- **TypeScript Path Resolution** - Automatic resolution of `tsconfig.json` paths
- **Consistent Test Patterns** - Standardized test file patterns
- **Coverage Configuration** - Pre-configured coverage settings
- **Mock Management** - Automatic mock reset and restore
- **Zero Configuration** - Works out of the box

## Installation

```bash
pnpm add -D @repo/vitest vitest
```

## Usage

### Basic Setup

Create a `vitest.config.mts` file in your package:

```typescript
import { defaultVitestConfig } from '@repo/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig(defaultVitestConfig);
```

That's it! Your tests are now configured with:
- TypeScript path resolution
- Test file patterns: `src/**/*.spec.ts` and `src/**/*.test.ts`
- Coverage for `src/**/*.{ts,tsx,js,mjs,mts}`
- Automatic mock reset and restore

### Custom Configuration

You can extend the default configuration:

```typescript
import { defaultVitestConfig } from '@repo/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  ...defaultVitestConfig,
  test: {
    ...defaultVitestConfig.test,
    environment: 'node',
    globals: true
  }
});
```

### Using Plugins

The package exports plugins that you can use directly:

```typescript
import { plugins } from '@repo/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins,
  test: {
    // Your custom test config
  }
});
```

## Default Configuration

The default configuration includes:

- **Test Patterns**:**
  - `src/**/*.spec.ts`
  - `src/**/*.test.ts`

- **Coverage**:
  - Includes: `src/**/*.{ts,tsx,js,mjs,mts}`
  - Excludes: `generated/**/*`

- **Mock Settings**:
  - `mockReset: true` - Resets mocks between tests
  - `restoreMocks: true` - Restores original implementations

- **Plugins**:
  - `vite-tsconfig-paths` - Resolves TypeScript path mappings

## Example: Package Test Setup

```typescript
// vitest.config.mts
import { defaultVitestConfig } from '@repo/vitest';
import { defineConfig } from 'vitest/config';

export default defineConfig(defaultVitestConfig);
```

```typescript
// src/index.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './index';

describe('myFunction', () => {
  it('should work correctly', () => {
    expect(myFunction()).toBe(true);
  });
});
```

## Running Tests

```bash
# Run tests
pnpm test

# Run tests in watch mode
pnpm test --watch

# Run tests with coverage
pnpm test --coverage
```

## API

### `defaultVitestConfig`

Default Vitest configuration object that can be spread into `defineConfig()`.

**Properties:**
- `plugins` - Array of Vitest plugins (includes tsconfig-paths)
- `test.include` - Test file patterns
- `test.coverage` - Coverage configuration
- `test.mockReset` - Reset mocks between tests
- `test.restoreMocks` - Restore original implementations

### `plugins`

Array of Vitest plugins, currently includes:
- `vite-tsconfig-paths()` - TypeScript path resolution

## TypeScript Path Resolution

This package automatically resolves TypeScript path mappings from your `tsconfig.json`. For example:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

You can then use these paths in your tests:

```typescript
import { something } from '@/utils/helpers';
```

## Testing

```bash
pnpm typecheck
```

## License

ISC
