import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: "/",
  server: {
    proxy: {
      "/algae-data": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      "/beach-weather": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
      "/algae_heatmap.json": {
        target: "http://localhost:5000",
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
