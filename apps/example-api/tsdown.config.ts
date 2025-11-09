import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: 'index.ts',
  platform: 'node',
  sourcemap: true,
  format: 'esm',
  // make sure that internal packages (@repo/*) are bundled into the output
  noExternal: [/^@repo\//],
  skipNodeModulesBundle: true,
  tsconfig: 'tsconfig.build.json',
  outDir: '.dist',
  
});
