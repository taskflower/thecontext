// vite.plugin.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Uzyskaj ścieżkę bieżącego pliku i katalogu
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pobierz nazwę pluginu z zmiennych środowiskowych
const pluginName = process.env.PLUGIN_NAME;

if (!pluginName) {
  console.error('PLUGIN_NAME environment variable is required');
  process.exit(1);
}

// Ścieżki
const pluginsFolder = path.resolve(__dirname, 'plugins');
const pluginPath = path.join(pluginsFolder, pluginName);

// Sprawdź czy plugin istnieje
if (!fs.existsSync(pluginPath)) {
  console.error(`Plugin folder not found: ${pluginPath}`);
  process.exit(1);
}

// Utwórz konfigurację dla pluginu
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: path.resolve(__dirname, 'public/plugins', pluginName),
    lib: {
      entry: path.resolve(pluginPath, 'index.ts'),
      name: `plugin-${pluginName}`,
      fileName: 'index',
      formats: ['es']
    },
    rollupOptions: {
      // Upewnij się, że zewnętrzne zależności nie są bundlowane
      external: ['react', 'react-dom'],
      output: {
        // Udostępnij globalne zmienne w buildzie UMD
        // dla zewnętrznych zależności
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});