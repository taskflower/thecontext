import path from "path";
import react from "@vitejs/plugin-react";
import Inspect from "vite-plugin-inspect";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import { lingui } from "@lingui/vite-plugin";

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["macros"],
      },
    }),
    lingui(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "apple-touch-icon.png"],
      manifest: {
        name: "THE CONTEXT - Context Builder",
        short_name: "THE CONTEXT",
        description: "Build and expand your knowledge context through structured task templates, interactive Kanban boards, and AI-powered document management.",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/assets/icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "/assets/icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
    Inspect(),
  ],
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
             // Radix UI components
             if (id.includes("@radix-ui")) {
              return "vendor-radix";
            }
            // Markdown editor
            if (id.includes("@uiw/react-md-editor")) {
              return "vendor-markdown";
            }
            // React core
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react-core";
            }
            // React Router
            if (id.includes("react-router-dom")) {
              return "vendor-router";
            }
            // Firebase
            if (id.includes("firebase")) {
              return "vendor-firebase";
            }
            // Utilities (clsx, tailwind-merge, etc)
            if (id.includes("clsx") || id.includes("tailwind-merge") || id.includes("class-variance-authority")) {
              return "vendor-utils";
            }
            // Lucide icons
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            // Zustand
            if (id.includes("zustand")) {
              return "vendor-state";
            }
            // Pozostałe react-related dependencies
            if (id.includes("react")) {
              return "vendor-react-misc";
            }
            // Add more conditions as needed
          }
        },
      },
    },
  },
});
