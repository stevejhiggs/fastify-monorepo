# @repo/vitest

Shared Vitest configuration for the monorepo.

## Exports

```typescript
import { defaultVitestConfig, plugins } from '@repo/vitest';
```

## Usage

In package `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config';
import { defaultVitestConfig, plugins } from '@repo/vitest';

export default defineConfig({
  ...defaultVitestConfig,
  plugins: [...plugins],
  test: {
    ...defaultVitestConfig.test
    // Package-specific overrides
  }
});
```

## Default Configuration

The shared config includes:

- TypeScript path resolution via `vite-tsconfig-paths`
- Test file patterns: `**/*.test.ts`, `**/*.spec.ts`
- Coverage collection for all `.ts` files
- Exclusions for node_modules and .dist

## Plugins

`plugins` array includes:

- `tsconfigPaths()` - Resolves tsconfig path aliases in tests

## Running Tests

```bash
# All packages
pnpm test

# Single package
pnpm --filter @repo/package-name test

# With coverage
pnpm test -- --coverage

# Watch mode
pnpm test -- --watch
```

## Environment Variables

Tests run with `LOG_LEVEL=warn` by default to reduce noise.

## Writing Tests

Co-locate tests with source files:

```
src/
  cache.ts
  cache.test.ts
```

Use descriptive test names:

```typescript
describe('createCache', () => {
  it('returns undefined for missing keys', async () => {
    const cache = createCache();
    expect(await cache.get('missing')).toBeUndefined();
  });
});
```
