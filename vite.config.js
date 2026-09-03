import { existsSync, unlinkSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'strip-cloudflare-redirects',
      closeBundle() {
        const redirects = path.join('dist', '_redirects');
        if (existsSync(redirects)) unlinkSync(redirects);
      },
    },
  ],
  appType: 'spa',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
