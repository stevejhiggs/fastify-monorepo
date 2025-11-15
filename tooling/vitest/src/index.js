import tsconfigPaths from 'vite-tsconfig-paths';

/**@type {import("vitest/config").Plugin[]} */
export const plugins = [tsconfigPaths()];

/**@type {Parameters<typeof import("vitest/config").defineConfig>[0]} */
export const defaultVitestConfig = {
  plugins,
  test: {
    include: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
    coverage: {
      include: ['src/**/*.{ts,tsx,js,mjs,mts}'],
      exclude: ['generated/**/*']
    },
    mockReset: true,
    restoreMocks: true
  }
};
