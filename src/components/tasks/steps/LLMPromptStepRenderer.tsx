/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/tasks/steps/LLMPromptStepRenderer.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useTaskStore } from '@/store/taskStore';
import { preparePrompt } from '@/services/llm/promptBuilder';
import llmService from '@/services/llm/llmService';
import { ITaskStep } from '@/utils/tasks/taskTypes';

interface LLMPromptStepRendererProps {
  step: ITaskStep;
  taskId: string;
  previousStepsData: Record<string, any>;
  onComplete: (data: any) => void;
}

export const LLMPromptStepRenderer: React.FC<LLMPromptStepRendererProps> = ({ 
  step, 
  taskId, 
  previousStepsData,
  onComplete 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [renderedPrompt, setRenderedPrompt] = useState('');
  const { updateStep, executeResponseAction } = useTaskStore();
  
  if (!step.promptConfig) {
    return <div>Brak konfiguracji promptu</div>;
  }
  
  // Przygotowanie promptu z podstawionymi zmiennymi
  const handlePreparePrompt = () => {
    const prepared = preparePrompt(step.promptConfig, previousStepsData);
    setRenderedPrompt(prepared);
  };
  
  // Wykonanie promptu
  const handleExecutePrompt = async () => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    
    try {
      // Przygotowanie promptu
      const prepared = preparePrompt(step.promptConfig, previousStepsData);
      setRenderedPrompt(prepared);
      
      // Wywołanie serwisu LLM
      const response = await llmService.sendRequest([
        { role: 'system', content: step.promptConfig.systemPrompt },
        { role: 'user', content: prepared }
      ]);
      
      // Aktualizacja kroku
      updateStep(taskId, step.id, { 
        output: response.content,
        status: 'completed'
      });
      
      // Wywołanie akcji odpowiedzi, jeśli są zdefiniowane
      if (step.responseActions) {
        await executeResponseAction(taskId, step.id);
      }
      
      onComplete(response.content);
    } catch (error) {
      console.error('Błąd wykonania promptu:', error);
      updateStep(taskId, step.id, { 
        output: `Błąd: ${error}`,
        status: 'failed'
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card className="bg-muted/20">
        <CardHeader>
          <CardTitle>Prompt LLM</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <h3 className="text-sm font-medium mb-1">Prompt systemowy:</h3>
            <div className="bg-muted/50 p-2 rounded text-sm font-mono mb-3">
              {step.promptConfig.systemPrompt}
            </div>
            
            <h3 className="text-sm font-medium mb-1">Prompt użytkownika:</h3>
            <div className="bg-muted/50 p-2 rounded text-sm font-mono">
              {renderedPrompt || step.promptConfig.userPromptTemplate}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreparePrompt}
              className="mt-2"
            >
              Podgląd promptu
            </Button>
          </div>
          
          {step.output && (
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-1">Odpowiedź:</h3>
              <div className="bg-white border p-2 rounded text-sm whitespace-pre-wrap">
                {step.output}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleExecutePrompt}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Przetwarzanie...
              </>
            ) : (
              'Wykonaj'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};