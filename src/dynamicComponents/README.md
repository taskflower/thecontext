# Dynamic Components

This directory contains dynamic components that can be loaded as plugins by the application.

## Plugin System

The application uses a plugin system that automatically discovers and registers components in this directory. 
Any React component exported as default from a file in this directory will be registered as a plugin.

## Creating Plugins

To create a new plugin:

1. Create a new `.tsx` file in this directory
2. Export a React component as default
3. Make sure your component follows the plugin interface pattern
4. The plugin will be automatically discovered and available in the Flow Editor

## Plugin Interface

Your plugin component should implement the `PluginComponentWithSchema` interface:

```typescript
import { PluginComponentWithSchema, PluginComponentProps } from '@/modules/plugins/types';

interface MyPluginData {
  // Define your plugin data structure here
  someProperty: string;
  anotherProperty: number;
}

const MyPlugin: PluginComponentWithSchema<MyPluginData> = ({ 
  data, 
  appContext 
}: PluginComponentProps<MyPluginData>) => {
  // Your component implementation
  return (
    <div>Plugin content</div>
  );
};

// Optional settings
MyPlugin.pluginSettings = {
  replaceUserInput: true,
  hideNavigationButtons: true
};

export default MyPlugin;
```

## Framework Design

The Context App is designed to be a framework for building flow-based applications through the GUI.
Instead of hardcoding application logic, use the plugin system to create modular, reusable components
that can be composed in the visual editor.