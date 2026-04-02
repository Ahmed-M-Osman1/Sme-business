import {defineConfig} from 'tsup';

export default defineConfig({
  entry: {
    'index': 'src/index.ts',
    '_vercel': 'api/index.ts',
  },
  format: 'esm',
  target: 'node20',
  outDir: 'dist',
  clean: true,
  splitting: false,
  noExternal: [/.*/],
});
