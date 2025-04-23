import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Tworzenie osobnych chunków dla szablonów
          "template-default": ["./src/tpl/default/index.ts"],
          "template-minimal": ["./src/tpl/minimal/index.ts"],
        },
      },
    },
  },
});
