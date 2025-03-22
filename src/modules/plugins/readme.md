# Plugin System - Developer Guide

## Getting Started

This application supports dynamic plugins that can be created and integrated without modifying the core codebase. The plugin system uses React Context to provide a secure and type-safe way to register and manage plugins.

## Setting Up the Plugin System

1. Wrap your application with the `PluginProvider`:

```tsx
// In your App.tsx or main layout component
import { PluginProvider } from './modules/plugins';

function App() {
  return (
    <PluginProvider>
      <YourAppComponents />
    </PluginProvider>
  );
}
```

## Creating a Plugin

1. Create a new React component in the `src/dynamicComponents` directory:

```tsx
// src/dynamicComponents/MyPlugin.tsx
import React from 'react';
import { PluginComponentProps } from '../modules/plugins/types';

const MyPlugin: React.FC<PluginComponentProps> = ({ data, appContext }) => {
  return (
    <div>
      <h2>My Custom Plugin</h2>
      <p>Current workspace: {appContext.currentWorkspace?.name || 'None'}</p>
      
      {/* Display any custom data passed to the plugin */}
      {data && (
        <div>
          <h3>Custom Data:</h3>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
      
      {/* Add your plugin functionality here */}
    </div>
  );
};

export default MyPlugin;
```

2. The plugin will be automatically discovered and registered on application startup.

## Plugin Props

Each plugin receives two props:

- `data`: Custom data sent to your plugin
- `appContext`: Application context with the following structure:
  ```js
  {
    currentWorkspace: /* Current workspace object */,
    currentScenario: /* Current scenario object */,
    currentNode: /* Current node object */,
    selection: {
      workspaceId: /* ID of selected workspace */,
      scenarioId: /* ID of selected scenario */,
      nodeId: /* ID of selected node */
    },
    stateVersion: /* Current state version */
  }
  ```

## Manual Registration

If your plugin is not in the `dynamicComponents` directory, register it manually:

```tsx
// Method 1: Using the PluginRegistry
import { PluginRegistry } from './modules/plugins';

// Register a component
PluginRegistry.register('MyCustomPlugin', MyCustomComponent);

// Method 2: Using the usePlugins hook in a React component
import { usePlugins } from './modules/plugins';

function MyComponent() {
  const { registerPlugin } = usePlugins();
  
  // Register a plugin in a useEffect
  useEffect(() => {
    registerPlugin('MyCustomPlugin', MyCustomComponent);
    
    // Cleanup on unmount
    return () => {
      unregisterPlugin('MyCustomPlugin');
    };
  }, []);
  
  // Rest of your component
}
```

## Accessing Plugins Programmatically

To access the plugin system from anywhere in your application:

```tsx
import { usePlugins } from './modules/plugins';

function MyComponent() {
  const { 
    getPluginKeys,            // Get all registered plugin keys
    getPluginComponent,       // Get a specific plugin component
    isPluginEnabled,          // Check if a plugin is enabled
    togglePlugin,             // Toggle a plugin on/off
    setPluginData,            // Send data to a plugin
    getPluginData             // Get data from a plugin
  } = usePlugins();
  
  // Example: Get all plugin keys
  const pluginKeys = getPluginKeys();
  
  // Example: Send data to a plugin
  const handleSendData = () => {
    setPluginData('MyPlugin', {
      message: 'Hello from app',
      timestamp: Date.now()
    });
  };
  
  // Rest of your component
}
```

## Loading Plugins Dynamically at Runtime

To load a plugin dynamically after the application has started:

```tsx
import { loadPlugin } from './modules/plugins';

// Load a plugin from a path
async function loadExternalPlugin(path) {
  const pluginKey = await loadPlugin(path);
  
  if (pluginKey) {
    console.log(`Successfully loaded plugin: ${pluginKey}`);
  } else {
    console.error('Failed to load plugin');
  }
}

// Example usage
loadExternalPlugin('./path/to/ExternalPlugin.js');
```

## Best Practices

1. Use clear, descriptive plugin names
2. Handle missing or invalid data gracefully
3. Keep plugins focused on a specific task
4. Use the app context for accessing current workspace/scenario data
5. Clean up any event listeners or external resources when your plugin component unmounts
6. Use TypeScript interfaces for plugin props and data for better type safety
7. Avoid using global state or direct DOM manipulation in plugins

## Type Safety

For better type safety, define interfaces for your plugin data:

```tsx
// Define your plugin's data interface
interface MyPluginData {
  config: {
    color: string;
    showDetails: boolean;
  };
  values: number[];
}

// Use it in your plugin
const MyPlugin: React.FC<PluginComponentProps<MyPluginData>> = ({ data, appContext }) => {
  // Now 'data' is typed as MyPluginData
  return (
    <div style={{ color: data?.config?.color }}>
      {/* Plugin content */}
    </div>
  );
};
```