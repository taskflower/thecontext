import path from "path";
import react from "@vitejs/plugin-react";
import Inspect from "vite-plugin-inspect";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react(), Inspect()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            if (id.includes("react-router-dom")) {
              return "vendor-react-router-dom";
            }
            if (id.includes("reactflow")) {
              return "vendor-reactflow";
            }
            if (id.includes("firebase")) {
              return "vendor-firebase";
            }
            // Add more conditions as needed
          }
        },
      },
    },
  },
});
