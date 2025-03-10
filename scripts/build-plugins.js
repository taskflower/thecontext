// scripts/build-plugins.js
const fs = require('fs');
const path = require('path');

// Ensure the plugins directory exists in public
function ensurePluginsDir() {
  const pluginsDir = path.resolve(__dirname, '../public/plugins');
  if (!fs.existsSync(pluginsDir)) {
    fs.mkdirSync(pluginsDir, { recursive: true });
    console.log('Created public/plugins directory');
  }
}

// Copy plugins from dist/plugins to public/plugins
function copyPlugins() {
  const sourceDir = path.resolve(__dirname, '../dist/plugins');
  const targetDir = path.resolve(__dirname, '../public/plugins');
  
  if (!fs.existsSync(sourceDir)) {
    console.error(`Source directory ${sourceDir} does not exist!`);
    process.exit(1);
  }
  
  // Make sure the target directory exists
  ensurePluginsDir();
  
  // Clear existing files in public/plugins to prevent duplication
  const existingFiles = fs.readdirSync(targetDir);
  existingFiles.forEach(file => {
    const filePath = path.join(targetDir, file);
    if (fs.statSync(filePath).isFile()) {
      fs.unlinkSync(filePath);
      console.log(`Removed existing file: ${file}`);
    }
  });
  
  // Copy only JS files (not SVGs or other assets) from dist/plugins to public/plugins
  const files = fs.readdirSync(sourceDir);
  let copiedCount = 0;
  
  files.forEach(file => {
    const sourcePath = path.join(sourceDir, file);
    
    // Skip directories and non-JS files
    if (fs.statSync(sourcePath).isFile() && file.endsWith('.js')) {
      const targetPath = path.join(targetDir, file);
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`Copied ${file} to public/plugins`);
      copiedCount++;
    }
  });
  
  console.log(`Successfully copied ${copiedCount} plugin files`);
}

// Generate manifest.json for plugins
function generateManifest() {
  const pluginsDir = path.resolve(__dirname, '../public/plugins');
  const manifestPath = path.join(pluginsDir, 'manifest.json');
  
  // List only JS files as plugins (exclude other assets)
  const plugins = fs.readdirSync(pluginsDir)
    .filter(file => file.endsWith('.js'));
  
  // Write manifest
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({ plugins }, null, 2)
  );
  
  console.log(`Generated manifest.json with ${plugins.length} plugins`);
}

// Execute operations
ensurePluginsDir();
copyPlugins();
generateManifest();