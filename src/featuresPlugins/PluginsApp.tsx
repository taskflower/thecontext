/* eslint-disable @typescript-eslint/no-explicit-any */
// src/featuresPlugins/PluginsApp.tsx
import React, { useEffect, useState } from 'react';
import useDynamicComponentStore from './dynamicComponentStore';
import DynamicComponentWrapper from './DynamicComponentWrapper';
import PluginManager from './PluginManager';

// Add this new function at the top of the file (or in a separate file)
const discoverAndLoadComponents = async () => {
  try {
    // Use import.meta.glob for Vite or require.context for webpack
    const componentModules = import.meta.glob('../dynamicComponents/*.tsx');
    
    for (const path in componentModules) {
      const module = await componentModules[path]();
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
    <div className="app-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <h1>Dynamic Component Loader</h1>
      
      {/* Plugin Manager */}
      <PluginManager />
      
      {componentKeys.length === 0 ? (
        <div className="no-components">
          <p>No components registered yet. Use the global registry to register components.</p>
          <pre style={{ backgroundColor: '#f5f5f5', padding: '10px', borderRadius: '4px', overflow: 'auto' }}>
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
          <div className="component-selector" style={{ marginBottom: '20px', marginTop: '20px' }}>
            <label htmlFor="component-select">Select Component: </label>
            <select 
              id="component-select"
              value={selectedComponent || ''}
              onChange={(e) => setSelectedComponent(e.target.value)}
              style={{ padding: '8px', marginLeft: '10px' }}
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
            <div style={{ padding: '15px', backgroundColor: '#fff2f0', border: '1px solid #ffccc7', borderRadius: '4px' }}>
              <p>The selected component is currently disabled. Enable it from the Plugin Manager to use it.</p>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
};

export default PluginsApp;