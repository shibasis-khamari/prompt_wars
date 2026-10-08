/// <reference types="vitest" />
import { defineConfig, Plugin, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createApiDevMiddleware } from './api/lib/devMiddleware';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server-plugin',
    configureServer(server) {
      server.middlewares.use(createApiDevMiddleware());
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  Object.assign(process.env, env);

  return {
    plugins: [react(), apiDevServerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
    },
  };
});
