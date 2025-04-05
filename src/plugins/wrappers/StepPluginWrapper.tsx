/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Wrapper for step plugins in flow
 */
import React from "react";
import { StepPluginProps } from "../types";
import { usePlugins } from "../context";

export interface StepPluginWrapperProps {
  pluginKey: string;
  node: any;
  onContinue?: () => void;
  processTemplate?: (text: string) => string;
  onContextUpdate?: (key: string, value: any) => void;
  getContextValue?: (key: string, path?: string) => any;
  className?: string;
}

/**
 * Wrapper component for step plugins
 */
const StepPluginWrapper: React.FC<StepPluginWrapperProps> = ({
  pluginKey,
  node,
  onContinue,
  processTemplate = (text) => text,
  onContextUpdate,
  getContextValue,
  className = "",
}) => {
  const { getPluginComponent } = usePlugins();

  // If no plugin key, render nothing
  if (!pluginKey) {
    return null;
  }

  // Get plugin data from node
  const pluginData = node.pluginData?.[pluginKey] || {};

  // Try to get the step component from the plugin
  const StepComponent = getPluginComponent?.(pluginKey, "StepComponent") as
    | React.ComponentType<StepPluginProps>
    | undefined;

  if (!StepComponent) {
    return (
      <div
        className={`bg-yellow-50 p-4 border border-yellow-200 rounded-md ${className}`}
      >
        <div className="text-yellow-800">
          <span className="font-bold">Plugin not found: </span>
          {pluginKey}
        </div>
        <div className="text-sm text-yellow-600 mt-1">
          Make sure the plugin is installed and registered correctly.
        </div>
      </div>
    );
  }

  // Render the step component with props
  return (
    <StepComponent
      id={pluginKey}
      node={node}
      data={pluginData}
      onContinue={onContinue}
      processTemplate={processTemplate}
      onContextUpdate={onContextUpdate}
      getContextValue={getContextValue}
      className={className}
    />
  );
};

export default StepPluginWrapper;
