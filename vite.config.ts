import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": "/src",
    },
  },
  build: {
    // Możesz dodać więcej opcji budowania, gdy będą potrzebne
  }
});