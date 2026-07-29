import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'], 
  format: ['cjs'],
  dts: false,
  sourcemap: true,
  clean: true,
  minify: false,
  target: 'node20',
  splitting: false,
  outDir: 'dist',
  external: [
    '@prisma/client',
    'bcryptjs',
    'jsonwebtoken',
    'stripe',
    'sslcommerz-lts',
  ],
});