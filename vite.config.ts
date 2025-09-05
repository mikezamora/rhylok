import { defineConfig } from 'vite';
import extismPlugin from 'vite-plugin-extism';

export default defineConfig({
  plugins: [
    extismPlugin({
      // Use the default configuration - the plugin will analyze TypeScript and generate DOM bindings
      memory: {
        max_pages: 16
      }
    })
  ],
  server: {
    allowedHosts: true, // Allow all hosts
  },
});
