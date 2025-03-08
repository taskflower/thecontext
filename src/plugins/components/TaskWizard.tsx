/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/TaskWizard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Forward,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui';


import { TaskContextProvider } from '@/plugins/TaskContext';

import { StepConfig } from '../types';
import { StepRenderer } from './StepRenderer';
import { usePluginManager } from '../pluginContext';

interface TaskWizardProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  steps: StepConfig[];
  onStepComplete: (stepId: string, result: Record<string, any>) => void;
  onStepSkip: (stepId: string) => void;
  onTaskComplete: () => void;
  initialStepIndex?: number;
}

export function TaskWizard({
  isOpen,
  onClose,
  taskId,
  steps,
  onStepComplete,
  onStepSkip,
  onTaskComplete,
  initialStepIndex = 0
}: TaskWizardProps) {
  // Get the plugin manager
  const pluginManager = usePluginManager();
  
  // Task context - will be shared between steps
  const [taskContext, setTaskContext] = useState<Record<string, any>>({});
  
  // Current step index
  const [currentStepIndex, setCurrentStepIndex] = useState(initialStepIndex);
  
  // Track if a step is currently processing
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Error state
  const [error, setError] = useState<string | null>(null);
  
  // Get the sorted steps
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);
  
  // Get the current step
  const currentStep = sortedSteps[currentStepIndex];
  
  // Check if we're at the first or last step
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === sortedSteps.length - 1;
  
  // Reset the wizard when it opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStepIndex(initialStepIndex);
      setError(null);
      setIsProcessing(false);
    }
  }, [isOpen, initialStepIndex]);
  
  // Handle moving to the next step
  const moveToNextStep = useCallback(() => {
    if (isLastStep) {
      onTaskComplete();
      onClose();
    } else {
      setCurrentStepIndex(prev => prev + 1);
      setError(null);
    }
  }, [isLastStep, onTaskComplete, onClose]);
  
  // Handle moving to the previous step
  const moveToPreviousStep = useCallback(() => {
    if (!isFirstStep) {
      setCurrentStepIndex(prev => prev - 1);
      setError(null);
    }
  }, [isFirstStep]);
  
  // Handle step completion
  const handleStepComplete = useCallback((
    stepId: string, 
    result: Record<string, any>,
    contextUpdates?: Record<string, any>
  ) => {
    // Update task context if provided
    if (contextUpdates) {
      setTaskContext(prev => ({
        ...prev,
        ...contextUpdates
      }));
    }
    
    // Call the parent's onStepComplete callback
    onStepComplete(stepId, result);
    
    // Move to the next step
    moveToNextStep();
    
    // Reset processing state
    setIsProcessing(false);
  }, [onStepComplete, moveToNextStep]);
  
  // Handle step error
  const handleStepError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setIsProcessing(false);
  }, []);
  
  // Handle skipping the current step
  const handleSkipStep = useCallback(() => {
    if (currentStep) {
      onStepSkip(currentStep.id);
      moveToNextStep();
    }
  }, [currentStep, onStepSkip, moveToNextStep]);
  
  // Handle the Next button click
  const handleNextClick = useCallback(async () => {
    if (!currentStep) return;
    
    // If the step is already completed, just move to the next one
    if (currentStep.status === 'completed') {
      moveToNextStep();
      return;
    }
    
    // Validate the step
    const validationResult = pluginManager.validateStep(currentStep, taskContext);
    if (!validationResult.valid) {
      setError(validationResult.error || 'Step validation failed');
      return;
    }
    
    // Start processing
    setError(null);
    setIsProcessing(true);
    
    try {
      // Execute the step
      const executionResult = await pluginManager.executeStep(currentStep.id, taskContext);
      
      if (executionResult.success) {
        // Update task context if provided
        if (executionResult.contextUpdates) {
          setTaskContext(prev => ({
            ...prev,
            ...executionResult.contextUpdates
          }));
        }
        
        // Call the parent's onStepComplete callback
        if (executionResult.result) {
          onStepComplete(currentStep.id, executionResult.result);
        }
        
        // Move to the next step
        moveToNextStep();
      } else {
        // Handle error
        setError(executionResult.error || 'Step execution failed');
      }
    } catch (error) {
      // Handle unexpected error
      setError(error instanceof Error ? error.message : String(error));
    } finally {
      // Reset processing state
      setIsProcessing(false);
    }
  }, [currentStep, taskContext, pluginManager, moveToNextStep, onStepComplete]);
  
  // If no steps or no current step, don't render anything
  if (!isOpen || !sortedSteps.length || !currentStep) {
    return null;
  }
  
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            Task Wizard - Step {currentStepIndex + 1} of {sortedSteps.length}
          </DialogTitle>
        </DialogHeader>
        
        {/* Progress bar */}
        <div className="flex items-center mt-2 mb-4 border-b pb-4 overflow-auto">
          {sortedSteps.map((step, index) => (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center flex-shrink-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center
                    ${
                      step.status === 'completed'
                        ? 'bg-primary/20 text-primary'
                        : index === currentStepIndex
                        ? 'bg-primary text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                >
                  {step.status === 'completed' ? (
                    <Check size={16} />
                  ) : (
                    index + 1
                  )}
                </div>
                <span
                  className={`text-xs mt-1 text-center w-16 truncate
                    ${
                      index === currentStepIndex
                        ? 'text-primary font-medium'
                        : 'text-muted-foreground'
                    }`}
                >
                  {step.title}
                </span>
              </div>
              
              {index < sortedSteps.length - 1 && (
                <div
                  className={`h-px w-16 mx-1 flex-shrink-0
                    ${index < currentStepIndex ? 'bg-primary' : 'bg-muted'}`}
                />
              )}
            </React.Fragment>
          ))}
        </div>
        
        {/* Error alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Step content */}
        <div className="flex-1 overflow-auto py-4">
          <TaskContextProvider taskId={taskId} initialContext={taskContext}>
            <StepRenderer
              key={currentStep.id}
              step={currentStep}
              context={taskContext}
              onComplete={(result, contextUpdates) => 
                handleStepComplete(currentStep.id, result, contextUpdates)
              }
              onError={handleStepError}
            />
          </TaskContextProvider>
        </div>
        
        {/* Navigation buttons */}
        <div className="flex justify-between pt-4 border-t mt-2">
          <div>
            {!isFirstStep && (
              <Button
                variant="outline"
                onClick={moveToPreviousStep}
                className="flex items-center"
                disabled={isProcessing}
              >
                <ArrowLeft size={16} className="mr-2" />
                Previous
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            {currentStep.status !== 'completed' && (
              <Button
                variant="ghost"
                onClick={handleSkipStep}
                className="flex items-center"
                disabled={isProcessing}
              >
                <Forward size={16} className="mr-2" />
                Skip
              </Button>
            )}
            
            <Button
              onClick={handleNextClick}
              className="flex items-center"
              disabled={isProcessing}
              data-testid="next-step-button"
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Processing...
                </>
              ) : isLastStep ? (
                <>
                  Finish
                  <Check size={16} className="ml-2" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}