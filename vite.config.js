import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: {
      // Set '@' to reference the 'src' directory
      '@': path.resolve(__dirname, './src'),
    },
  },
})
