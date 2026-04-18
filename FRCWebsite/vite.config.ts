import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function runGalleryThumbs(): void {
  const script = path.join(__dirname, 'scripts', 'generate-gallery-thumbnails.mjs');
  execFileSync(process.execPath, [script], { cwd: __dirname, stdio: 'inherit' });
}

function runGalleryManifest(): void {
  const script = path.join(__dirname, 'scripts', 'generate-gallery-manifest.mjs');
  execFileSync(process.execPath, [script], { cwd: __dirname, stdio: 'inherit' });
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'gallery-manifest',
      // Dev only: `npm run build` already runs scripts/generate-gallery-manifest.mjs first.
      configureServer() {
        runGalleryThumbs();
        runGalleryManifest();
      },
    },
  ],
  root: '.',           // ensures project root is used
  server: {
    host: 'localhost',
    port: 5173,
    strictPort: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',    // output folder
    emptyOutDir: true,
  },
});
