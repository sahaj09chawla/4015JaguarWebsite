import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.',           // ensures project root is used
  build: {
    outDir: 'dist',    // output folder
    emptyOutDir: true,
  },
});
