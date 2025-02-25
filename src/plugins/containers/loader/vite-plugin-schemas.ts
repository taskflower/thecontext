// vite-plugin-schemas.ts
import { Plugin } from 'vite';
import * as path from 'path';
import * as fs from 'fs';

export function schemaPlugin(): Plugin {
  const virtualModuleId = 'virtual:schemas';
  const resolvedVirtualModuleId = '\0' + virtualModuleId;

  return {
    name: 'vite-plugin-schemas',
    
    resolveId(id) {
      if (id === virtualModuleId) {
        return resolvedVirtualModuleId;
      }
    },

    async load(id) {
      if (id === resolvedVirtualModuleId) {
        // Ścieżka do katalogu z pluginami schematów
        const schemasDir = path.resolve(__dirname, 'src/plugins/schema/customSchemas');
        
        // Wczytaj wszystkie pliki .ts z katalogu
        const schemaFiles = fs.readdirSync(schemasDir)
          .filter(file => file.endsWith('.ts'));

        // Generuj kod importujący wszystkie schematy
        const imports = schemaFiles
          .map((file, index) => `import schema${index} from './customSchemas/${file}';`)
          .join('\n');

        // Generuj tablicę schematów
        const schemaArray = schemaFiles
          .map((_, index) => `schema${index}`)
          .join(',\n  ');

        return `${imports}

export const schemas = [
  ${schemaArray}
];`;
      }
    },

    configureServer(server) {
      // Hot reload dla plików schematów
      server.watcher.add(path.resolve(__dirname, 'src/plugins/schema/customSchemas/**'));
      
      server.watcher.on('change', (path) => {
        if (path.includes('customSchemas')) {
          // Invalidate module
          const mod = server.moduleGraph.getModuleById(resolvedVirtualModuleId);
          if (mod) {
            server.moduleGraph.invalidateModule(mod);
            server.ws.send({
              type: 'full-reload'
            });
          }
        }
      });
    }
  };
}