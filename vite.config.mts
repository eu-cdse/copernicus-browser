import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import svgrPlugin from 'vite-plugin-svgr';
import dns from 'dns';

dns.setDefaultResultOrder('verbatim');

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    open: true,
    host: 'localhost',
    port: 3000,
  },
  preview: {
    port: 3000,
  },
  base: '',
  plugins: [react(), svgrPlugin()],
  build: {
    outDir: './build',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
