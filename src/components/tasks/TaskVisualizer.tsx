/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/tasks/TaskVisualizer.tsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useTaskStore } from '@/store/taskStore';

import { stepTypeRegistry } from '@/utils/tasks/registry/stepTypeRegistry';
import { ITaskStep } from '@/utils/tasks/taskTypes';

interface TaskVisualizerProps {
  taskId: string;
}

export const TaskVisualizer: React.FC<TaskVisualizerProps> = ({ taskId }) => {
  const [activeStepId, setActiveStepId] = useState<string | null>(null);
  const [previousStepsData, setPreviousStepsData] = useState<Record<string, any>>({});
  
  const task = useTaskStore(state => state.tasks.find(t => t.id === taskId));
  const executeTaskStep = useTaskStore(state => state.executeTaskStep);
  
  useEffect(() => {
    if (task) {
      // Zbierz dane z poprzednich kroków
      const data: Record<string, any> = {};
      
      task.steps.forEach(step => {
        if (step.output) {
          try {
            data[step.id] = JSON.parse(step.output);
          } catch (e) {
            data[step.id] = { text: step.output };
          }
        }
      });
      
      setPreviousStepsData(data);
      
      // Ustaw aktywny krok na pierwszy oczekujący
      if (!activeStepId) {
        const pendingStep = task.steps
          .sort((a, b) => a.order - b.order)
          .find(s => s.status === 'pending');
        
        if (pendingStep) {
          setActiveStepId(pendingStep.id);
        } else {
          setActiveStepId(task.steps[0]?.id || null);
        }
      }
    }
  }, [task, activeStepId]);
  
  if (!task) {
    return <div>Zadanie nie znalezione</div>;
  }
  
  // Sortowanie kroków według kolejności
  const sortedSteps = [...task.steps].sort((a, b) => a.order - b.order);
  
  const getStepClassName = (step: ITaskStep) => {
    let baseClass = "p-4 border rounded-md cursor-pointer ";
    
    if (step.id === activeStepId) {
      baseClass += "border-primary bg-primary/10 ";
    } else {
      baseClass += "border-border ";
    }
    
    switch (step.status) {
      case "completed": return baseClass + "border-green-500 bg-green-50";
      case "in_progress": return baseClass + "border-blue-500 bg-blue-50";
      case "failed": return baseClass + "border-red-500 bg-red-50";
      default: return baseClass;
    }
  };
  
  const getStepIcon = (step: ITaskStep) => {
    switch (step.type) {
      case "form": return "📝";
      case "llm_prompt": return "🤖";
      case "llm_response": return "📊";
      case "retrieval": return "🔍";
      case "processing": return "⚙️";
      case "generation": return "✨";
      case "validation": return "✅";
      default: return "📋";
    }
  };
  
  const handleStepCompletion = (stepId: string, data: any) => {
    // Aktualizacja danych z poprzednich kroków
    setPreviousStepsData(prev => ({
      ...prev,
      [stepId]: data
    }));
    
    // Przejdź do następnego kroku
    const currentStepIndex = sortedSteps.findIndex(s => s.id === stepId);
    if (currentStepIndex < sortedSteps.length - 1) {
      setActiveStepId(sortedSteps[currentStepIndex + 1].id);
    }
  };
  
  const renderStepContent = () => {
    if (!activeStepId) return null;
    
    const step = sortedSteps.find(s => s.id === activeStepId);
    if (!step) return null;
    
    // Pobierz odpowiedni renderer dla typu kroku
    const handler = stepTypeRegistry.getHandler(step.type);
    if (!handler || !handler.renderComponent) {
      return (
        <div>
          <h3 className="font-medium mb-2">{step.description}</h3>
          <p className="text-sm text-muted-foreground">
            Typ kroku: {step.type}
          </p>
          {step.output && (
            <div className="mt-4">
              <h4 className="text-sm font-medium">Wynik:</h4>
              <div className="bg-muted p-2 rounded whitespace-pre-wrap">
                {step.output}
              </div>
            </div>
          )}
        </div>
      );
    }
    
    // Renderuj komponent dla danego typu kroku
    const StepComponent = handler.renderComponent;
    return (
      <StepComponent
        step={step}
        taskId={taskId}
        previousStepsData={previousStepsData}
        onComplete={(data) => handleStepCompletion(step.id, data)}
      />
    );
  };
  
  return (
    <div className="space-y-6">
      {/* Nagłówek zadania */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">{task.title}</h2>
        <p className="text-muted-foreground">{task.description}</p>
        <div className="flex space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            task.status === 'completed' ? 'bg-green-100 text-green-800' :
            task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            task.status === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {task.status}
          </span>
          <span className={`px-2 py-1 text-xs rounded-full ${
            task.priority === 'high' ? 'bg-red-100 text-red-800' :
            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {task.priority}
          </span>
        </div>
      </div>
      
      {/* Lista kroków */}
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {sortedSteps.map(step => (
          <div 
            key={step.id}
            className={getStepClassName(step)}
            onClick={() => setActiveStepId(step.id)}
            style={{ minWidth: '200px' }}
          >
            <div className="flex items-center space-x-2">
              <span className="text-xl">{getStepIcon(step)}</span>
              <span className="font-medium">{step.description}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Krok {step.order} • {step.type}
            </div>
            <div className="mt-2 text-xs inline-block px-2 py-1 rounded-full bg-muted">
              {step.status}
            </div>
          </div>
        ))}
      </div>
      
      {/* Zawartość aktywnego kroku */}
      {activeStepId && (
        <div className="border rounded-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold">
              {sortedSteps.find(s => s.id === activeStepId)?.description}
            </h3>
            
            <Button
              onClick={() => executeTaskStep(taskId, activeStepId)}
              disabled={
                sortedSteps.find(s => s.id === activeStepId)?.status === 'in_progress' ||
                sortedSteps.find(s => s.id === activeStepId)?.status === 'completed'
              }
            >
              Wykonaj krok
            </Button>
          </div>
          
          {renderStepContent()}
        </div>
      )}
    </div>
  );
};