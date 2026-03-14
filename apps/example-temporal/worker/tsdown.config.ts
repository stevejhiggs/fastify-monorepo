import { defineConfig } from 'tsdown/config';

export default defineConfig({
  // input
  entry: ['src/index.ts'],

  deps: {
    // Bundle @repo/* packages, keep everything else external
    alwaysBundle: [/^@repo\//],
    neverBundle: (id) => !id.startsWith('@repo/') && !id.startsWith('.') && !id.startsWith('/')
  },

  platform: 'node',
  tsconfig: 'tsconfig.json',

  // output
  outDir: process.env.DIST_DIR ?? '.dist',
  sourcemap: true,
  format: 'esm'
});
