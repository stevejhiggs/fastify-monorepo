import { defineConfig } from 'tsdown/config';

export default defineConfig({
  // input
  entry: ['src/index.ts', 'src/telemetry.ts'],

  // transform
  skipNodeModulesBundle: true,
  // make sure that internal packages (@repo/*) are bundled into the output
  noExternal: [/^@repo\//],
  platform: 'node',
  tsconfig: 'tsconfig.json',

  // output
  outDir: process.env.DIST_DIR ?? '.dist',
  sourcemap: true,
  format: 'esm'
});
