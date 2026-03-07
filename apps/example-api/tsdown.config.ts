import { defineConfig } from 'tsdown/config';

export default defineConfig({
  // input
  entry: ['src/index.ts', 'src/telemetry.ts'],

  // transform
  deps: {
    // make sure that internal packages (@repo/*) are bundled into the output
    alwaysBundle: [/^@repo\//]
  },

  platform: 'node',
  tsconfig: 'tsconfig.json',

  // output
  outDir: process.env.DIST_DIR ?? '.dist',
  sourcemap: true,
  format: 'esm'
});
