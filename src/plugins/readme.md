# Plugin System Integration Guide

## 1. Update Entry Point

Modify your main entry file (src/main.tsx or equivalent):

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// Import the plugin manager to initialize it
import './plugins/pluginManager';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

## 2. Wrap Your App with PluginProvider

Update your App component:

```tsx
// src/App.tsx
import { AppPlugins } from './plugins/components/AppPlugins';
import { PluginProvider } from './plugins/components/PluginProvider';
import { PluginMarketplace } from './plugins/components/PluginMarketplace';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';

function App() {
  const [marketplaceOpen, setMarketplaceOpen] = useState(false);
  
  return (
    <PluginProvider>
      <div className="min-h-screen flex flex-col">
        <header className="border-b p-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Plugin System Demo</h1>
          <Button 
            variant="outline" 
            onClick={() => setMarketplaceOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Plugin Marketplace
          </Button>
        </header>
        
        <main className="flex-1 p-4">
          <AppPlugins />
        </main>
        
        <PluginMarketplace
          open={marketplaceOpen}
          onClose={() => setMarketplaceOpen(false)}
        />
      </div>
    </PluginProvider>
  );
}

export default App;
```

## 3. Update AppPlugins Component

Modify the existing AppPlugins component to use the new plugin system:

```tsx
// src/plugins/components/AppPlugins.tsx
import { useEffect, useState } from "react";
import { StepConfig } from "../types";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { StepsList } from "./StepsList";
import { TaskWizard } from "./TaskWizard";
import { PluginAddDialog } from "./PluginAddDialog";
import { PluginManagerProvider } from "../pluginContext";
import { usePluginStore } from "../store/pluginStore"; // Add this import

// Demo task ID
const DEMO_TASK_ID = 'task-demo-1';

export default function AppPlugins() {
  // Application state
  const [steps, setSteps] = useState<StepConfig[]>([]);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [pluginDialogOpen, setPluginDialogOpen] = useState(false);
  
  // Get plugins from store instead
  const pluginsLoaded = usePluginStore(state => 
    Object.keys(state.registeredPlugins).length > 0 && !state.isLoading
  );
  
  // Add steps to window for plugin access
  useEffect(() => {
    window.appSteps = steps;
    return () => {
      window.appSteps = undefined;
    };
  }, [steps]);
  
  // Rest of your component remains the same
  // ...

  return (
    <PluginManagerProvider>
      {/* Component content... */}
    </PluginManagerProvider>
  );
}
```

## 4. Update PluginAddDialog Component

Modify the PluginAddDialog to use the plugin store:

```tsx
// src/plugins/components/PluginAddDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { PluginRegistration } from '../types';
import { usePluginStore } from '../store/pluginStore'; // Change this

interface PluginAddDialogProps {
  open: boolean;
  onClose: () => void;
  taskId: string;
  onAddStep: (taskId: string, stepData: any) => void;
}

export function PluginAddDialog({
  open,
  onClose,
  taskId,
  onAddStep,
}: PluginAddDialogProps) {
  // Use the store instead of the context
  const pluginManager = usePluginStore(state => ({
    getAllPlugins: () => Object.values(state.registeredPlugins)
  }));
  
  // Rest of the component remains the same
  // ...
}
```

## 5. Add Build Configuration

1. Create a `vite.plugin.config.js` file in your project root with the provided code.
2. Add the build scripts to your package.json:

```json
{
  "scripts": {
    "build:plugins": "node scripts/build-plugins.js",
    "dev:plugins": "vite --config vite.plugin.config.js --watch"
  }
}
```

3. Create the `scripts/build-plugins.js` file with the provided code.
4. Create a `plugins` directory in your project root for plugin development.
5. Create a `public/plugins` directory for compiled plugins.

## 6. Update Existing Plugins

Update your text-input plugin to use the new format:

```ts
// src/plugins/textInput/index.ts
import { registerPlugin } from '../registry';
import { TextInputEditor } from './TextInputEditor';
import { TextInputViewer } from './TextInputViewer';
import { TextInputResult } from './TextInputResult';
import { TextInputValidation } from './TextInputValidation';
import { PluginManifest } from '../types';

// Add a manifest
export const manifest: PluginManifest = {
  id: 'text-input',
  name: 'Text Input',
  version: '1.0.0',
  description: 'Allows users to input text',
  author: 'App Team',
};

// Export a register function
export function register() {
  const registration = {
    id: 'text-input',
    name: 'Text Input',
    description: 'Allows users to input text',
    icon: null,
    category: 'Data',
    
    capabilities: {
      autoExecutable: false,
      requiresUserInput: true,
      producesOutput: true,
      consumesOutput: false
    },
    
    defaultConfig: {
      label: 'Enter text',
      placeholder: 'Type here...',
      minLength: 0,
      maxLength: 1000,
      required: true,
      multiline: true,
      rows: 6
    },
    
    EditorComponent: TextInputEditor,
    ViewerComponent: TextInputViewer,
    ResultComponent: TextInputResult,
    validate: TextInputValidation,
    
    // Add manifest
    manifest
  };
  
  registerPlugin(registration);
  return registration;
}

// Default export
export default {
  register,
  manifest
};
```

## 7. Update PluginLoader

Replace your existing PluginLoader component with the new version:

```tsx
// src/plugins/PluginLoader.tsx
import { useToast } from '@/hooks/useToast';
import { useEffect, useState } from 'react';
import { usePluginStore } from './store/pluginStore';
import { Loader2 } from 'lucide-react';

export default function PluginLoaderToast() {
  const { toast } = useToast();
  const [initialLoad, setInitialLoad] = useState(true);
  
  const { 
    isLoading, 
    registeredPlugins 
  } = usePluginStore(state => ({
    isLoading: state.isLoading,
    registeredPlugins: state.registeredPlugins
  }));
  
  // Count of registered plugins
  const pluginCount = Object.keys(registeredPlugins).length;
  
  // Show loading and success messages
  useEffect(() => {
    if (initialLoad && !isLoading && pluginCount > 0) {
      toast({
        title: "Plugins loaded",
        description: `${pluginCount} plugins have been successfully loaded`,
      });
      setInitialLoad(false);
    }
  }, [isLoading, pluginCount, toast, initialLoad]);
  
  // Show loading indicator only during initial load
  if (initialLoad && isLoading) {
    return (
      <div className="fixed bottom-4 right-4 bg-background border shadow-md rounded-md p-3 flex items-center space-x-2">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="text-sm">Loading plugins...</span>
      </div>
    );
  }
  
  return null;
}
```

## 8. Update Registry.ts

Replace your existing registry.ts with the new version provided in the plugin-integration artifact.