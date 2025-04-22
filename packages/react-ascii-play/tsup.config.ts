import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/modules/*.js'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: false,
  clean: true,
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
}); 