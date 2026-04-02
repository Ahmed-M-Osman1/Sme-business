import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    index: 'src/index.ts',
    'api/index': 'api/index.ts',
  },
  format: 'esm',
  target: 'node20',
  outDir: 'dist',
  clean: true,
  splitting: true,
  sourcemap: true,
  noExternal: [
    '@shory/db',
    '@shory/shared',
  ],
});
