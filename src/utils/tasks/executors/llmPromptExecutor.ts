/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/tasks/executors/llmPromptExecutor.ts
import { useTaskStore } from '@/store/taskStore';
import { buildPromptMessages } from '@/services/llm/promptBuilder';
import llmService from '@/services/llm/llmService';

export async function executeLLMPromptStep(taskId: string, stepId: string): Promise<boolean> {
  const { tasks, updateStep, executeResponseAction } = useTaskStore.getState();
  
  const task = tasks.find(t => t.id === taskId);
  if (!task) return false;
  
  const step = task.steps.find(s => s.id === stepId);
  if (!step || !step.promptConfig) return false;
  
  updateStep(taskId, stepId, { status: 'in_progress' });
  
  try {
    // Inicjalizacja serwisu LLM
    await llmService.init();
    
    // Zbieramy dane z poprzednich kroków jako zmienne
    const variables: Record<string, any> = {};
    
    task.steps.forEach(prevStep => {
      if (prevStep.order < step.order && prevStep.output) {
        try {
          variables[prevStep.id] = JSON.parse(prevStep.output);
        } catch {
          variables[prevStep.id] = { text: prevStep.output };
        }
      }
    });
    
    // Przygotowanie promptu
    const messages = buildPromptMessages(step.promptConfig, variables);
    
    // Wywołanie LLM
    const response = await llmService.sendRequest(messages);
    
    // Aktualizacja kroku
    updateStep(taskId, stepId, { 
      output: response.content,
      status: 'completed'
    });
    
    // Wywołanie akcji odpowiedzi, jeśli są zdefiniowane
    if (step.responseActions) {
      await executeResponseAction(taskId, stepId);
    }
    
    return true;
  } catch (error) {
    console.error('Błąd wykonania kroku LLM:', error);
    updateStep(taskId, stepId, { 
      output: `Błąd: ${error}`,
      status: 'failed'
    });
    return false;
  }
}