# Plugin System - Developer Guide

## Getting Started

This application supports dynamic plugins that can be created and integrated without modifying the core codebase.

## Creating a Plugin

1. Create a new React component in the `src/dynamicComponents` directory:

```jsx
// src/dynamicComponents/MyPlugin.tsx
import React from 'react';

const MyPlugin = ({ data, appContext }) => {
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

```js
// Method 1: Using the global registry
window.__DYNAMIC_COMPONENTS__.register('MyCustomPlugin', MyCustomComponent);

// Method 2: Using the imported function
import { registerDynamicComponent } from './modules/plugins/pluginsStore';
registerDynamicComponent('MyCustomPlugin', MyCustomComponent);
```

## Sending Data to Plugins

To programmatically send data to a plugin:

```js
import useDynamicComponentStore from './modules/plugins/pluginsStore';

// Set data for a specific plugin
useDynamicComponentStore.getState().setComponentData('MyPlugin', {
  message: 'Hello from app',
  timestamp: Date.now()
});
```

## Reacting to Plugin State Changes

To know when plugins are enabled or disabled:

```js
// Listen for plugin state changes
window.addEventListener('plugin-state-change', (event) => {
  const pluginState = event.detail; // Object with plugin keys and enabled state
  
  // Example: { "MyPlugin": true, "AnotherPlugin": false }
  console.log('Plugin state changed:', pluginState);
  
  // Check if a specific plugin is enabled
  if (pluginState['MyPlugin']) {
    // Do something when MyPlugin is enabled
  }
});
```

## Best Practices

1. Use clear, descriptive plugin names
2. Handle missing or invalid data gracefully
3. Keep plugins focused on a specific task
4. Use the app context for accessing current workspace/scenario data
5. Clean up any event listeners or external resources when your plugin component unmounts