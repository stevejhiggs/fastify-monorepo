import { defineConfig } from 'tsdown/config';

export default defineConfig({
  // input
  entry: 'src/index.ts',

  // transform
  skipNodeModulesBundle: true,
  // make sure that internal packages (@repo/*) are bundled into the output
  noExternal: [/^@repo\//],
  platform: 'node',
  tsconfig: 'tsconfig.build.json',

  // output
  outDir: '.dist',
  sourcemap: true,
  format: 'esm',
});
