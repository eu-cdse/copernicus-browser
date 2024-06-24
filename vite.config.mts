import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
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
  // https://stackoverflow.com/questions/78115258/module-has-been-externalized-for-browser-compatibility-error
  plugins: [react(), svgrPlugin(), nodePolyfills()],
  build: {
    outDir: './build',
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
