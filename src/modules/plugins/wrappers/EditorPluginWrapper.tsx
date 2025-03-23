// src/modules/plugins/wrappers/EditorPluginWrapper.tsx
import React, { useState } from 'react';
import { usePlugins } from '../pluginContext';
import PluginPreviewWrapper from './PluginPreviewWrapper';
import { Settings } from 'lucide-react';
import { PluginComponentWithSchema } from '../types';

interface EditorPluginWrapperProps {
  componentKey: string;
}

/**
 * A specialized wrapper for the plugin editor that shows the plugin 
 * with additional controls for configuration
 */
const EditorPluginWrapper: React.FC<EditorPluginWrapperProps> = ({ componentKey }) => {
  const { getPluginData, setPluginData, getPluginComponent } = usePlugins();
  const [showSettings, setShowSettings] = useState(false);
  
  // Get the plugin component to access its schema
  const PluginComponent = getPluginComponent(componentKey) as PluginComponentWithSchema | null;
  const optionsSchema = PluginComponent?.optionsSchema;
  
  // Get current plugin data
  const currentData = getPluginData(componentKey) || {};
  
  // Handle settings update
  const handleSettingChange = (key: string, value: unknown) => {
    const newData = { ...currentData as Record<string, unknown>, [key]: value };
    setPluginData(componentKey, newData);
  };
  
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="bg-card-foreground/5 px-4 py-2 flex justify-between items-center">
        <h3 className="font-medium">Plugin Preview</h3>
        {optionsSchema && (
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-1.5 rounded-md hover:bg-accent/70 transition-colors"
            title="Configure Plugin"
          >
            <Settings size={18} className="text-muted-foreground" />
          </button>
        )}
      </div>
      
      <div className="flex flex-col md:flex-row">
        {/* Plugin preview */}
        <div className={`${showSettings && optionsSchema ? 'md:w-2/3' : 'w-full'}`}>
          <PluginPreviewWrapper 
            componentKey={componentKey}
            showHeader={false}
            className="border-0"
          />
        </div>
        
        {/* Settings panel */}
        {showSettings && optionsSchema && (
          <div className="md:w-1/3 p-4 border-t md:border-t-0 md:border-l border-border bg-muted/5">
            <h4 className="text-sm font-medium mb-3">Plugin Settings</h4>
            
            <div className="space-y-3">
              {Object.entries(optionsSchema).map(([key, schema]) => (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium">
                    {schema.label || key}
                  </label>
                  
                  {schema.type === 'color' && (
                    <div className="flex items-center space-x-2">
                      <input 
                        type="color"
                        value={(currentData as Record<string, string>)[key] || schema.default as string}
                        onChange={(e) => handleSettingChange(key, e.target.value)}
                        className="h-8 w-8 rounded cursor-pointer"
                      />
                      <input 
                        type="text"
                        value={(currentData as Record<string, string>)[key] || schema.default as string}
                        onChange={(e) => handleSettingChange(key, e.target.value)}
                        className="flex-1 px-2 py-1 text-xs rounded border border-border bg-background"
                      />
                    </div>
                  )}
                  
                  {schema.type === 'string' && (
                    <input 
                      type="text"
                      value={(currentData as Record<string, string>)[key] || schema.default as string}
                      onChange={(e) => handleSettingChange(key, e.target.value)}
                      className="w-full px-2 py-1 text-xs rounded border border-border bg-background"
                    />
                  )}
                  
                  {schema.type === 'number' && (
                    <input 
                      type="number"
                      value={(currentData as Record<string, number>)[key] || schema.default as number}
                      onChange={(e) => handleSettingChange(key, Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs rounded border border-border bg-background"
                    />
                  )}
                  
                  {schema.type === 'boolean' && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input 
                        type="checkbox"
                        checked={(currentData as Record<string, boolean>)[key] ?? schema.default as boolean}
                        onChange={(e) => handleSettingChange(key, e.target.checked)}
                        className="rounded"
                      />
                      <span className="text-xs">{schema.description}</span>
                    </label>
                  )}
                  
                  {schema.description && schema.type !== 'boolean' && (
                    <p className="text-xs text-muted-foreground">
                      {schema.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EditorPluginWrapper;