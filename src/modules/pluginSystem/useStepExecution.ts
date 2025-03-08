/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/useStepExecution.ts
import { useEffect, useCallback, useRef } from 'react';
import { TaskContext, StepViewerProps } from './types';
import { pluginManager } from './pluginManager';


/**
 * Hook that handles step execution and registers the step with the plugin manager
 * 
 * This hook should be used within step viewer components to:
 * 1. Register themselves as executable steps
 * 2. Handle automatic execution
 * 3. Clean up when unmounted
 */
export function useStepExecution({
  step,
  onComplete,
  onError
}: StepViewerProps) {
  // Keep track of component mounted state
  const isMounted = useRef(true);
  
  // Create a safer onComplete callback that checks if component is mounted
  const safeOnComplete = useCallback((
    result: Record<string, any>,
    contextUpdates?: Partial<TaskContext>
  ) => {
    if (isMounted.current) {
      onComplete(result, contextUpdates);
    }
  }, [onComplete]);
  
  // Create a safer onError callback that checks if component is mounted
  const safeOnError = useCallback((error: string) => {
    if (isMounted.current) {
      onError(error);
    }
  }, [onError]);
  
  // Create the executor function that will be registered with the plugin manager
  const executeStep = useCallback(async (executionContext: TaskContext) => {
    try {
      // Get the plugin definition
      const plugin = pluginManager.getPlugin(step.type);
      
      if (!plugin) {
        throw new Error(`Unknown plugin type: ${step.type}`);
      }
      
      // Validate the step configuration
      const validation = plugin.validate(step, executionContext);
      if (!validation.valid) {
        throw new Error(validation.error || 'Invalid step configuration');
      }
      
      // Return a Promise that will be resolved by the component
      return new Promise((resolve, reject) => {
        // Store the resolver and rejecter so they can be called by the component
        (window as any).__STEP_HANDLERS__ = {
          ...(window as any).__STEP_HANDLERS__ || {},
          [step.id]: {
            resolve: (result: any, contextUpdates?: Partial<TaskContext>) => {
              resolve({ result, contextUpdates });
            },
            reject: (error: Error | string) => {
              reject(error);
            }
          }
        };
        
        // Trigger auto-execution if component supports it
        if (isMounted.current) {
          // Dispatch a custom event that the component can listen for
          const event = new CustomEvent('step:execute', {
            detail: {
              stepId: step.id,
              context: executionContext
            }
          });
          window.dispatchEvent(event);
        } else {
          // If the component is not mounted, reject the promise
          reject(new Error('Component not mounted'));
        }
      });
    } catch (error) {
      return Promise.reject(error);
    }
  }, [step]);
  
  // Event handler for the step:execute event
  const handleExecuteEvent = useCallback((event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail?.stepId === step.id) {
      // Component should implement its own execution logic
      // and call safeOnComplete or safeOnError when done
    }
  }, [step.id, safeOnComplete, safeOnError]);
  
  // Register the executor when the component mounts, unregister when it unmounts
  useEffect(() => {
    isMounted.current = true;
    pluginManager.registerStepExecutor(step.id, executeStep);
    window.addEventListener('step:execute', handleExecuteEvent);
    
    // Clean up
    return () => {
      isMounted.current = false;
      pluginManager.unregisterStepExecutor(step.id);
      window.removeEventListener('step:execute', handleExecuteEvent);
      
      // Clean up any pending handlers
      if ((window as any).__STEP_HANDLERS__?.[step.id]) {
        delete (window as any).__STEP_HANDLERS__[step.id];
      }
    };
  }, [step.id, executeStep, handleExecuteEvent]);
  
  // Return functions that the component can use to complete/error the step
  return {
    completeStep: safeOnComplete,
    errorStep: safeOnError,
    // Helper to manually trigger execution from within the component
    executeStep: () => {
      const handler = (window as any).__STEP_HANDLERS__?.[step.id];
      if (handler) {
        try {
          // Component should implement execution and call
          // handler.resolve or handler.reject
        } catch (error) {
          if (handler.reject) {
            handler.reject(error instanceof Error ? error : new Error(String(error)));
          }
        }
      }
    }
  };
}