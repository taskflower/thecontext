// src/modules/plugins/wrappers/PluginPreviewWrapper.tsx
import React, { useState, useEffect } from "react";
import { usePlugins } from "../pluginContext";
import { useAppStore } from "../../store";
import { AppContextData, PluginComponentWithSchema, PluginPreviewWrapperProps } from "../types";

const PluginPreviewWrapper: React.FC<PluginPreviewWrapperProps> = ({
  componentKey,
  customData,
  context = {},
  showHeader = true,
  className = "",
}) => {
  const { getPluginComponent, getPluginData, isPluginEnabled } = usePlugins();
  const [error, setError] = useState<string | null>(null);

  // Check if there's an active flow session
  const isFlowPlaying = useAppStore(
    (state) => state.flowSession?.isPlaying || false
  );

  // Get the appropriate update functions based on session state
  const updateNodeUserPrompt = useAppStore((state) =>
    isFlowPlaying ? state.updateTempNodeUserPrompt : state.updateNodeUserPrompt
  );

  const updateNodeAssistantMessage = useAppStore((state) =>
    isFlowPlaying
      ? state.updateTempNodeAssistantMessage
      : state.updateNodeAssistantMessage
  );

  // Get current selection from store
  const selectedNodeId = useAppStore((state) => state.selected.node);

  // Get the plugin component
  const PluginComponent = getPluginComponent(componentKey) as PluginComponentWithSchema | null;

  // Get plugin settings if available
  const pluginSettings = PluginComponent?.pluginSettings || {};

  // Combine custom data with stored plugin data
  const storedData = getPluginData(componentKey);
  const mergedData = customData !== undefined ? customData : storedData;

  // Create plugin context with necessary data
  const completeContext: AppContextData = {
    currentWorkspace: null,
    currentScenario: null,
    currentNode: null,
    selection: {
      workspaceId: context.selection?.workspaceId || "",
      scenarioId: context.selection?.scenarioId || "",
      nodeId: context.selection?.nodeId || selectedNodeId,
    },
    stateVersion: context.stateVersion || 0,
    updateNodeUserPrompt, // Pass the appropriate function
    updateNodeAssistantMessage, // Pass the appropriate function
    ...context, // Include all other context properties
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
      {showHeader && !pluginSettings.replaceHeader && (
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
          <ErrorBoundary onError={(err: Error) => setError(err.message)}>
            <PluginComponent data={mergedData} appContext={completeContext} />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

// Error boundary component with proper typing
interface ErrorBoundaryProps {
  children: React.ReactNode;
  onError: (error: Error) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    this.props.onError(error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

export default PluginPreviewWrapper;