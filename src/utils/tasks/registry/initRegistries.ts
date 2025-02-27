// src/utils/tasks/registry/initRegistries.ts
import { stepTypeRegistry } from './stepTypeRegistry';
import { actionTypeRegistry } from './actionTypeRegistry';


// Importy komponentów renderujących
import { FormStepRenderer } from '@/components/tasks/steps/FormStepRenderer';
import { LLMPromptStepRenderer } from '@/components/tasks/steps/LLMPromptStepRenderer';
import { GenericStepRenderer } from '@/components/tasks/steps/GenericStepRenderer';

// Importy edytorów konfiguracji
import { FormConfigEditor } from '@/components/tasks/editors/FormConfigEditor';
import { PromptConfigEditor } from '@/components/tasks/editors/PromptConfigEditor';
// import { ResponseMappingEditor } from '@/components/tasks/editors/ResponseMappingEditor';

// Importy metod wykonawczych
import { executeFormStep } from '@/utils/tasks/executors/formStepExecutor';
import { executeLLMPromptStep } from '@/utils/tasks/executors/llmPromptExecutor';
import { executeGenericStep } from '@/utils/tasks/executors/genericStepExecutor';

// Importy akcji
import { createContainer, createDocument, createTask, createTemplate, updateProject } from '@/services/execution/entityFactory';
import { StepType } from '../taskTypes';

export function initializeRegistries() {
  // Rejestracja typów kroków
  stepTypeRegistry.register('form', {
    renderComponent: FormStepRenderer,
    editorComponent: FormConfigEditor,
    executeFunction: executeFormStep
  });
  
  stepTypeRegistry.register('llm_prompt', {
    renderComponent: LLMPromptStepRenderer,
    editorComponent: PromptConfigEditor,
    executeFunction: executeLLMPromptStep
  });
  
  // Rejestracja domyślnych typów
  ['retrieval', 'processing', 'generation', 'validation', 'custom'].forEach(type => {
    stepTypeRegistry.register(type as StepType, {
      renderComponent: GenericStepRenderer,
      editorComponent: () => null, // Brak dedykowanego edytora
      executeFunction: executeGenericStep
    });
  });
  
  // Rejestracja typów akcji
  actionTypeRegistry.register('create_container', {
    executeFunction: createContainer
  });
  
  actionTypeRegistry.register('create_document', {
    executeFunction: createDocument
  });
  
  actionTypeRegistry.register('create_task', {
    executeFunction: createTask
  });
  
  actionTypeRegistry.register('create_template', {
    executeFunction: createTemplate
  });
  
  actionTypeRegistry.register('update_project', {
    executeFunction: updateProject
  });
}