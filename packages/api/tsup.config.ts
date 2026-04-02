import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    'api/index': 'api/entry.ts',
  },
  format: 'esm',
  target: 'node20',
  outDir: '.',
  clean: false,
  splitting: false,
  noExternal: [/.*/],
});
