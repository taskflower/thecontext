// src/modules/plugins/wrappers/PluginPreviewWrapper.tsx
import React, { useState, useEffect } from "react";
import { usePlugins } from "../pluginContext";
import { AppContextData } from "../types";

interface PluginPreviewWrapperProps {
  componentKey: string;
  customData?: unknown;
  context?: Partial<AppContextData>;
  showHeader?: boolean;
  className?: string;
}

/**
 * A flexible wrapper component for plugins that can be used in different contexts:
 * - Plugin editor
 * - Step-by-step node preview
 * - Any other place where plugins need to be displayed
 */
const PluginPreviewWrapper: React.FC<PluginPreviewWrapperProps> = ({
  componentKey,
  customData,
  context = {},
  showHeader = true,
  className = "",
}) => {
  const { getPluginComponent, getPluginData, isPluginEnabled } = usePlugins();
  const [error, setError] = useState<string | null>(null);

  // Get the plugin component
  const PluginComponent = getPluginComponent(componentKey);

  // Combine custom data with stored plugin data
  const storedData = getPluginData(componentKey);
  const mergedData = customData !== undefined ? customData : storedData;

  // Default app context if not provided
  const defaultContext: AppContextData = {
    currentWorkspace: null,
    currentScenario: null,
    currentNode: null,
    selection: {
      workspaceId: "",
      scenarioId: "",
      nodeId: "",
    },
    stateVersion: 0,
    ...context,
  };

  // Reset error when plugin key changes
  useEffect(() => {
    setError(null);
  }, [componentKey]);

  // Check if plugin is enabled
  if (!isPluginEnabled(componentKey)) {
    return (
      <div className={`p-4 bg-muted/20 rounded-md text-center ${className}`}>
        <p className="text-sm text-muted-foreground">
          Plugin <strong>{componentKey}</strong> is currently disabled
        </p>
      </div>
    );
  }

  // Check if plugin exists
  if (!PluginComponent) {
    return (
      <div
        className={`p-4 bg-red-100 dark:bg-red-900/20 rounded-md ${className}`}
      >
        <p className="text-sm text-red-600 dark:text-red-400">
          Plugin <strong>{componentKey}</strong> not found
        </p>
      </div>
    );
  }

  // Render the plugin with error boundary
  return (
    <div className={`plugin-wrapper ${className}`}>
      {showHeader && (
        <div className="flex justify-between items-center px-3 py-2 bg-muted/10 border-b border-border text-sm">
          <span className="font-medium">{componentKey}</span>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            Plugin Preview
          </span>
        </div>
      )}

      <div className="plugin-content">
        {error ? (
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-md m-2">
            <p className="text-sm text-red-600 dark:text-red-400 font-medium mb-1">
              Error in plugin {componentKey}:
            </p>
            <p className="text-xs text-red-500 dark:text-red-400 font-mono whitespace-pre-wrap">
              {error}
            </p>
          </div>
        ) : (
          <ErrorBoundary onError={(err) => setError(err.message)}>
            <PluginComponent data={mergedData} appContext={defaultContext} />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

// Simple error boundary component to catch plugin errors
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { hasError: boolean }
> {
  constructor(props: {
    children: React.ReactNode;
    onError: (error: Error) => void;
  }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null; // Error message is displayed by parent component
    }
    return this.props.children;
  }
}

export default PluginPreviewWrapper;
