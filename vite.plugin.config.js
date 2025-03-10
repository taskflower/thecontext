// vite.plugin.config.js
import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'plugin-manifest',
      closeBundle() {
        // Generate manifest directly in the public/plugins directory
        const pluginsDir = path.resolve(__dirname, 'public/plugins');
        
        // Ensure plugins directory exists
        if (!fs.existsSync(pluginsDir)) {
          fs.mkdirSync(pluginsDir, { recursive: true });
        }
        
        // Generate manifest.json
        const plugins = fs.readdirSync(pluginsDir)
          .filter(file => file.endsWith('.js'));
        
        fs.writeFileSync(
          path.join(pluginsDir, 'manifest.json'),
          JSON.stringify({ plugins }, null, 2)
        );
        
        console.log('Plugin manifest created:', plugins);
      }
    }
  ],
  build: {
    // Output directly to public/plugins
    outDir: 'public/plugins',
    emptyOutDir: true, // Clean output directory before each build
    lib: {
      formats: ['es'],
      // Using files from src/plugins/external with .ts and .tsx extensions only
      entry: Object.fromEntries(
        fs.readdirSync(path.resolve(__dirname, 'src/plugins/external'))
          .filter(file => file.endsWith('.tsx') || file.endsWith('.ts')) 
          .map(file => [
            // Remove extension for the entry name
            file.replace(/\.(tsx|ts)$/, ''),
            // Full path to the file
            path.resolve(__dirname, 'src/plugins/external', file)
          ])
      )
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'zustand'],
      output: {
        // Don't use nested directory structure
        preserveModules: false,
        // Output only JS files for the actual plugins
        entryFileNames: '[name].js',
        // Global variables to use in UMD build for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          zustand: 'zustand'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});