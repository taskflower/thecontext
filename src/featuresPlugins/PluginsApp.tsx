/* eslint-disable @typescript-eslint/no-explicit-any */
// src/featuresPlugins/PluginsApp.tsx
import React, { useEffect, useState, ComponentType } from 'react';
import useDynamicComponentStore from './dynamicComponentStore';
import DynamicComponentWrapper from './DynamicComponentWrapper';
import PluginManager from './PluginManager';

// Define the interface for the module
interface ComponentModule {
  default: ComponentType<any>;
}

// Add this new function at the top of the file (or in a separate file)
const discoverAndLoadComponents = async () => {
  try {
    // Use import.meta.glob for Vite or require.context for webpack
    const componentModules = import.meta.glob('../dynamicComponents/*.tsx');
    
    for (const path in componentModules) {
      const module = await componentModules[path]() as ComponentModule;
      const componentName = path.split('/').pop()?.replace('.tsx', '') || '';
      
      if (window.__DYNAMIC_COMPONENTS__ && module.default) {
        window.__DYNAMIC_COMPONENTS__.register(componentName, module.default);
        console.log(`Auto-discovered and registered: ${componentName}`);
      }
    }
  } catch (error) {
    console.error("Error during component discovery:", error);
  }
};

// This is our main app that will render dynamic components
const PluginsApp: React.FC = () => {
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const getComponentKeys = useDynamicComponentStore(state => state.getComponentKeys);
  const componentKeys = getComponentKeys();
  const [pluginState, setPluginState] = useState<Record<string, boolean>>({});
  
  // Set first component as selected by default when available
  useEffect(() => {
    if (componentKeys.length > 0 && !selectedComponent) {
      setSelectedComponent(componentKeys[0]);
    }
  }, [componentKeys, selectedComponent]);

  // Create a global window property to allow dynamic component registration
  useEffect(() => {
    // Extend the window interface
    const win = window as any;
    
    // Create a global registry if it doesn't exist
    if (!win.__DYNAMIC_COMPONENTS__) {
      win.__DYNAMIC_COMPONENTS__ = {
        registry: useDynamicComponentStore.getState(),
        register: (key: string, component: React.ComponentType<any>) => {
          useDynamicComponentStore.getState().registerComponent(key, component);
        },
        unregister: (key: string) => {
          useDynamicComponentStore.getState().unregisterComponent(key);
        }
      };
    }
    
    // Add component auto-discovery here
    discoverAndLoadComponents();
    
    return () => {
      // Cleanup (optional)
      // delete win.__DYNAMIC_COMPONENTS__;
    };
  }, []);

  // Listen for plugin state changes
  useEffect(() => {
    const handlePluginStateChange = (event: CustomEvent) => {
      setPluginState(event.detail);
    };
    
    window.addEventListener('plugin-state-change' as any, handlePluginStateChange);
    
    return () => {
      window.removeEventListener('plugin-state-change' as any, handlePluginStateChange);
    };
  }, []);

  // Check if selected component is enabled
  const isComponentEnabled = (key: string) => {
    return pluginState[key] !== false; // Default to true if not specified
  };

  return (
    <div className="max-w-4xl mx-auto p-5">
      <h1 className="text-2xl font-bold mb-6">Dynamic Component Loader</h1>
      
      {/* Plugin Manager */}
      <PluginManager />
      
      {componentKeys.length === 0 ? (
        <div className="mt-6">
          <p>No components registered yet. Use the global registry to register components.</p>
          <pre className="bg-gray-100 p-3 rounded-md overflow-auto mt-3 text-sm">
            {`// Register a component dynamically without importing it in App
const MyComponent = () => <div>My Component Content</div>;

// Method 1: Using the window object
window.__DYNAMIC_COMPONENTS__.register('MyComponent', MyComponent);

// Method 2: Using the exported function (if you import it)
import { registerDynamicComponent } from './store/dynamicComponentStore';
registerDynamicComponent('MyComponent', MyComponent);`}
          </pre>
        </div>
      ) : (
        <>
          <div className="mb-5 mt-5">
            <label htmlFor="component-select" className="mr-2">Select Component: </label>
            <select 
              id="component-select"
              value={selectedComponent || ''}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="p-2 ml-2 border border-gray-300 rounded-md"
            >
              {componentKeys.map(key => (
                <option key={key} value={key} disabled={!isComponentEnabled(key)}>
                  {key} {!isComponentEnabled(key) ? '(Disabled)' : ''}
                </option>
              ))}
            </select>
          </div>
          
          {selectedComponent && isComponentEnabled(selectedComponent) ? (
            <DynamicComponentWrapper componentKey={selectedComponent} />
          ) : selectedComponent ? (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p>The selected component is currently disabled. Enable it from the Plugin Manager to use it.</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default PluginsApp;