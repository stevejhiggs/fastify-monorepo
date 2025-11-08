import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: 'index.ts',
  platform: 'node',
  sourcemap: true,
  // make sure that internal packages (@repo/*) are bundled into the output
  noExternal: [/^@repo\//],
  outDir: '.dist'
});
