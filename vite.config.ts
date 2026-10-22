import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig, Plugin } from 'vite';

const syncPortfolioPlugin = (): Plugin => ({
  name: 'sync-portfolio-data-plugin',
  configureServer(server) {
    server.middlewares.use('/api/save-portfolio-data', (req, res) => {
      if (req.method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk;
        });
        req.on('end', () => {
          try {
            const data = JSON.parse(body);
            const backupFile = path.resolve(__dirname, 'public/portfolio-backup.json');
            const dataFile = path.resolve(__dirname, 'src/data/persistedLinks.json');
            fs.writeFileSync(backupFile, JSON.stringify(data, null, 2), 'utf-8');
            fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf-8');
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true, imagesCount: Object.keys(data.images || {}).length }));
          } catch (err: any) {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: err.message }));
          }
        });
      } else {
        res.end();
      }
    });
  },
});

export default defineConfig(() => {
  return {
    base: '/',
    plugins: [react(), tailwindcss(), syncPortfolioPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
