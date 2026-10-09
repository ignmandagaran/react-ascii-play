import { defineConfig } from 'tsup';

export default defineConfig((options) => ({
  entry: ['src/index.ts', 'src/modules/*.js'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  // In watch mode, wiping dist would race the demo app's dev server, which
  // resolves the package from dist while tsup rebuilds it.
  clean: !options.watch,
  outDir: 'dist',
  treeshake: true,
  sourcemap: true,
  minify: true,
  external: ['react'],
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.js' : '.mjs',
    };
  },
}));
