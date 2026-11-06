import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: { outDir: 'dist', emptyOutDir: true, rollupOptions: { output: { entryFileNames: 'assets/index.js', assetFileNames: 'assets/[name][extname]' } } },
  server: { port: 5173, proxy: { '/api': 'http://127.0.0.1:8000' } },
});
