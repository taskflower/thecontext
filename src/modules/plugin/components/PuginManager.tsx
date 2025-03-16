// src/modules/plugin/components/PluginManager.tsx
import React, { useState, useMemo } from 'react';
import { pluginRegistry } from '../plugin-registry';
import { usePluginStore } from '../store';

export const PluginManager: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { activatePlugin, deactivatePlugin } = usePluginStore();
  
  // Use useMemo to prevent registry calls during each render
  const plugins = useMemo(() => pluginRegistry.getAllPlugins(), []);
  
  // Get plugin status from store
  const pluginStates = usePluginStore(state => state.plugins);
  
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 z-50 bg-blue-500 text-white p-2 rounded-md shadow-lg hover:bg-blue-600"
      >
        Plugins
      </button>
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full max-h-[80vh] overflow-auto">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-bold">Plugin Manager</h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="p-4">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border p-2 text-left">Name</th>
                <th className="border p-2 text-left">Description</th>
                <th className="border p-2 text-left">Version</th>
                <th className="border p-2 text-left">Status</th>
                <th className="border p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {plugins.length > 0 ? (
                plugins.map(plugin => {
                  const isActive = pluginStates[plugin.config.id]?.active || false;
                  
                  return (
                    <tr key={plugin.config.id} className="border-b">
                      <td className="border p-2 font-medium">
                        {plugin.config.name}
                      </td>
                      <td className="border p-2">
                        {plugin.config.description}
                      </td>
                      <td className="border p-2">
                        {plugin.config.version}
                      </td>
                      <td className="border p-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="border p-2">
                        <button
                          onClick={() => {
                            if (isActive) {
                              deactivatePlugin(plugin.config.id);
                            } else {
                              activatePlugin(plugin.config.id);
                            }
                          }}
                          className={`px-3 py-1 rounded-md text-white text-sm ${isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                        >
                          {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="border p-4 text-center text-gray-500">
                    No plugins available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={() => setIsOpen(false)}
            className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};