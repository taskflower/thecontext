/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Wrapper for editor plugins
 */
import React from 'react';
import { EditorPluginProps } from '../types';
import { usePlugins } from '../context';

export interface EditorPluginWrapperProps {
  pluginKey: string;
  node: any; 
  onNodeUpdate?: (nodeUpdates: Partial<any>) => void;
  className?: string;
}

/**
 * Wrapper component for editor plugins
 */
const EditorPluginWrapper: React.FC<EditorPluginWrapperProps> = ({
  pluginKey,
  node,
  onNodeUpdate,
  className = ''
}) => {
  const { getPluginComponent } = usePlugins();
  
  // If no plugin key, render nothing
  if (!pluginKey) {
    return null;
  }
  
  // Get plugin data from node
  const pluginData = node.pluginData?.[pluginKey] || {};
  
  // Try to get the editor component from the plugin
  const EditorComponent = getPluginComponent?.(pluginKey, 'EditorComponent') as React.ComponentType<EditorPluginProps> | undefined;
  
  if (!EditorComponent) {
    return (
      <div className={`bg-red-50 p-4 border border-red-200 rounded-md ${className}`}>
        <div className="text-red-800">
          <span className="font-bold">Editor Plugin not found: </span>{pluginKey}
        </div>
        <div className="text-sm text-red-600 mt-1">
          Make sure the plugin is installed and registered correctly.
        </div>
      </div>
    );
  }
  
  // Render the editor component with props
  return (
    <EditorComponent
      id={pluginKey}
      node={node}
      data={pluginData}
      onNodeUpdate={onNodeUpdate}
      className={className}
    />
  );
};

export default EditorPluginWrapper;