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
    rollupOptions: {
      output: {
        // Module workers need a JavaScript MIME type, and not every web server maps `.mjs` to one. Emit
        // maplibre-gl's worker as `.js` so the deployed host doesn't need extra MIME config.
        assetFileNames: (assetInfo) =>
          (assetInfo.names ?? []).some((name) => name.startsWith('maplibre-gl-worker'))
            ? 'assets/[name]-[hash].js'
            : 'assets/[name]-[hash][extname]',
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
