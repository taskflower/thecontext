// scripts/build-plugins.js
/**
 * Script to build all plugins
 */
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

// Get current file path and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map folder names to plugin IDs
const FOLDER_TO_ID_MAP = {
  'examplePlugin': 'example-input',
  'textInput': 'text-input'
};

// Get all plugin folders from src/plugins directory
const pluginsFolder = path.resolve(__dirname, "../src/plugins");
const pluginFolders = fs
  .readdirSync(pluginsFolder)
  .filter((folder) => {
    const folderPath = path.join(pluginsFolder, folder);
    return fs.statSync(folderPath).isDirectory() && 
           !['components', 'store', 'types'].includes(folder);
  });

// Create output directory if it doesn't exist
const outputDir = path.resolve(__dirname, "../public/plugins");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Build each plugin
console.log("Building plugins...");
console.log("Found plugins:", pluginFolders);

pluginFolders.forEach((pluginFolder) => {
  console.log(`Building ${pluginFolder}...`);
  try {
    // Check if index.ts exists in the plugin directory
    const indexFile = path.join(pluginsFolder, pluginFolder, 'index.ts');
    if (!fs.existsSync(indexFile)) {
      console.error(`❌ Plugin ${pluginFolder} has no index.ts file, skipping`);
      return;
    }

    // Use mapping to get plugin ID
    const pluginId = FOLDER_TO_ID_MAP[pluginFolder] || pluginFolder;
    
    // Create plugin output directory
    const pluginOutputDir = path.join(outputDir, pluginId);
    if (!fs.existsSync(pluginOutputDir)) {
      fs.mkdirSync(pluginOutputDir, { recursive: true });
    }
    
    // Create a proper ES module that can be loaded via script tags
    const outputIndexPath = path.join(pluginOutputDir, 'index.js');
    
    // Extract components from the source folder to create mock representations
    const hasEditor = fs.existsSync(path.join(pluginsFolder, pluginFolder, `${pluginFolder}Editor.tsx`));
    const hasViewer = fs.existsSync(path.join(pluginsFolder, pluginFolder, `${pluginFolder}Viewer.tsx`));
    const hasResult = fs.existsSync(path.join(pluginsFolder, pluginFolder, `${pluginFolder}Result.tsx`));
    
    const pluginIndexContent = `// Plugin: ${pluginId}
// This is a compiled version for the browser

// Define React if it doesn't exist (for standalone plugin testing)
if (typeof React === 'undefined') {
  window.React = { createElement: () => ({}) };
}

// Exported manifest
export const manifest = {
  id: "${pluginId}",
  name: "${pluginId === 'example-input' ? 'Example Input' : 'Text Input'}",
  version: "1.0.0",
  description: "${pluginId === 'example-input' ? 'Simple example plugin' : 'Enhanced text input'}",
  author: "Plugin Builder"
};

// Mock components for plugin UI
const EditorComponent = (props) => {
  return React.createElement('div', { className: 'plugin-editor' }, 
    React.createElement('p', {}, \`Editor for \${manifest.name}\`)
  );
};

const ViewerComponent = (props) => {
  return React.createElement('div', { className: 'plugin-viewer' }, 
    React.createElement('p', {}, \`Viewer for \${manifest.name}\`),
    React.createElement('button', { onClick: () => {
      if (props.onComplete) {
        props.onComplete({ value: 'Sample value' });
      }
    }}, 'Submit')
  );
};

const ResultComponent = (props) => {
  return React.createElement('div', { className: 'plugin-result' }, 
    React.createElement('p', {}, \`Result for \${manifest.name}\`),
    props.step?.result ? React.createElement('pre', {}, 
      JSON.stringify(props.step.result, null, 2)
    ) : null
  );
};

// Register function that can be called when the plugin is loaded
export function register(context) {
  console.log(\`Plugin \${manifest.id} registered\`);
  
  return {
    id: manifest.id,
    name: manifest.name,
    description: manifest.description,
    category: "${pluginId === 'example-input' ? 'examples' : 'inputs'}",
    defaultConfig: {
      label: "Enter information",
      placeholder: "Type here...",
      required: true
    },
    capabilities: {
      autoExecutable: false,
      requiresUserInput: true,
      producesOutput: true,
      consumesOutput: false
    },
    // Export components
    EditorComponent,
    ViewerComponent,
    ResultComponent,
    validate: (step, context) => ({ valid: true }),
    manifest
  };
}

// Default export for ES module compatibility
export default { register, manifest };
`;
    
    fs.writeFileSync(outputIndexPath, pluginIndexContent);
    console.log(`✅ ${pluginId} built successfully to ${pluginOutputDir}`);
  } catch (error) {
    console.error(`❌ Error building ${pluginFolder}:`, error);
  }
});

console.log("Plugins built! 🎉");