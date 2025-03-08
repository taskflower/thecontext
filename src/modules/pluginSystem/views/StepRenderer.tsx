/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/components/StepRenderer.tsx
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { StepConfig, StepViewerProps, TaskContext } from '@/modules/pluginSystem/types';
import { usePluginManager } from '../context/pluginContext';

interface StepRendererProps {
  step: StepConfig;
  context: TaskContext;
  onComplete: (result: Record<string, any>, contextUpdates?: Partial<TaskContext>) => void;
  onError: (error: string) => void;
}

/**
 * Component that renders the appropriate step component based on step type
 */
export function StepRenderer({
  step,
  context,
  onComplete,
  onError
}: StepRendererProps) {
  // Get the plugin manager
  const pluginManager = usePluginManager();
  
  // Get the plugin for the step type
  const plugin = pluginManager.getPlugin(step.type);
  
  // If no plugin found, display error
  if (!plugin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Plugin not found for type: {step.type}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Get the viewer component for the step type
  const ViewerComponent = plugin.ViewerComponent;
  
  // Prepare props for the viewer component
  const viewerProps: StepViewerProps = {
    step,
    context,
    onComplete,
    onError
  };
  
  // Render the viewer component
  return <ViewerComponent {...viewerProps} />;
}

/**
 * Component that renders the appropriate result component based on step type
 */
export function StepResultRenderer({
  step,
  context
}: {
  step: StepConfig;
  context: TaskContext;
}) {
  // Get the plugin manager
  const pluginManager = usePluginManager();
  
  // Get the plugin for the step type
  const plugin = pluginManager.getPlugin(step.type);
  
  // If no plugin found or step has no result, don't render anything
  if (!plugin || !step.result) {
    return (
      <div className="text-sm text-muted-foreground italic">
        No results available
      </div>
    );
  }
  
  // Get the result component for the step type
  const ResultComponent = plugin.ResultComponent;
  
  // Render the result component
  return <ResultComponent step={step} context={context} />;
}

/**
 * Component that renders the appropriate editor component based on step type
 */
export function StepEditorRenderer({
  step,
  onChange
}: {
  step: StepConfig;
  onChange: (updates: Partial<StepConfig>) => void;
}) {
  // Get the plugin manager
  const pluginManager = usePluginManager();
  
  // Get the plugin for the step type
  const plugin = pluginManager.getPlugin(step.type);
  
  // If no plugin found, display error
  if (!plugin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Plugin not found for type: {step.type}
        </AlertDescription>
      </Alert>
    );
  }
  
  // Get the editor component for the step type
  const EditorComponent = plugin.EditorComponent;
  
  // Render the editor component
  return <EditorComponent step={step} onChange={onChange} />;
}