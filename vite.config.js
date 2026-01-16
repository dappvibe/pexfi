import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  cacheDir: './.cache/vite',
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@contracts': path.resolve(__dirname, './evm/protocol'),
      '@deployments': path.resolve(__dirname, './evm/ignition/deployments'),
      '@artifacts': path.resolve(__dirname, './evm/artifacts'),
      '@tests': path.resolve(__dirname, './tests/web'),
      '@e2e': path.resolve(__dirname, './tests/e2e'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/web/setup.ts',
    testTimeout: 120000,
  },
})
