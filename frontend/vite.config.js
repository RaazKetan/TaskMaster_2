import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  root: ".",
  publicDir: "public",
  server: {
    port: 5000,
    host: "0.0.0.0",
    allowedHosts: [
      "all",
      "a0aa5d3f-70ff-436a-bcc8-25645a48fed4-00-1kt65dlszcfqs.sisko.replit.dev",
      ".replit.dev",
      "localhost",
    ],
    proxy: {
      "/api": {
        target: "http://0.0.0.0:8000",
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
  build: {
    outDir: "dist",
    assetsDir: "assets",
  },
  define: {
    global: "globalThis",
    "process.env": {},
  },
  plugins: [react()],
});