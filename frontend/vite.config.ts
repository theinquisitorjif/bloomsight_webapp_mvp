import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/algae-data': {
        target: 'http://localhost:5000',
        changeOrigin: true
      },
      '/beach-weather': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
      '/algae_heatmap.json': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
