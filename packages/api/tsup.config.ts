import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    'api/index': 'api/index.ts',
  },
  format: 'esm',
  target: 'node20',
  outDir: '.',
  clean: false,
  splitting: false,
  noExternal: [/.*/],
});
