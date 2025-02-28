/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/tasks/TaskFlow/stepsPlugins/PluginLoader.tsx
import React, { Suspense, useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { getPluginRenderer, loadPluginRenderer, PluginRendererProps } from "./registry";
import { Step } from "@/types";

interface PluginLoaderProps {
  step: Step;
  onComplete: (result?: Record<string, any>) => void;
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-6 w-6 animate-spin text-primary" />
    <span className="ml-2">Loading plugin...</span>
  </div>
);

const PluginLoader: React.FC<PluginLoaderProps> = ({ step, onComplete }) => {
  const [PluginComponent, setPluginComponent] = useState<React.ComponentType<PluginRendererProps> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPlugin = async () => {
      try {
        // First check if we already have this plugin renderer cached
        let renderer = getPluginRenderer(step.type);
        
        // If not, dynamically load it
        if (!renderer) {
          renderer = await loadPluginRenderer(step.type);
        }
        
        setPluginComponent(() => renderer!);
        setError(null);
      } catch (err) {
        console.error(`Error loading plugin for type ${step.type}:`, err);
        setError(`Failed to load plugin for type: ${step.type}`);
      }
    };

    loadPlugin();
  }, [step.type]);

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Plugin Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!PluginComponent) {
    return <LoadingFallback />;
  }

  return (
    <Suspense fallback={<LoadingFallback />}>
      <PluginComponent step={step} onComplete={onComplete} />
    </Suspense>
  );
};

export default PluginLoader;