// src/_modules/scenarioGenerator/hooks/useScenarioEditor.ts
import { useState, useCallback, useEffect } from 'react';
import { useAppStore } from '@/hooks';
import { 
  EnhancedScenario,
  StepData,
  ValidationResult 
} from '../types';
import { 
  validateScenario, 
  generateScenarioImplementation,
  generateInitialContextCode,
  createDefaultStep,
  reorderSteps
} from '../utils/scenarioUtils';
import {
  generateScenarioWithAI,
  convertToEnhancedScenario
} from '../services/scenarioGenerationService';
import { useLlmService } from './useLlmService';

interface UseScenarioEditorProps {
  existingScenario?: any;
  mode?: 'create' | 'edit';
  onComplete?: (scenarioCode: string, initialContextCode?: string) => void;
}

interface UseScenarioEditorReturn {
  // State
  scenario: EnhancedScenario;
  isLoading: boolean;
  error: string | null;
  generatedCode: string;
  hasChanges: boolean;
  validationResult: ValidationResult;
  editingStepIndex: number | null;
  availableTemplates: any[];
  selectedTemplateId: string;
  
  // Step functions
  addStep: (type: StepData['tplFile']) => void;
  updateStep: (index: number, updates: Partial<StepData>) => void;
  removeStep: (index: number) => void;
  moveStep: (index: number, direction: 'up' | 'down') => void;
  setEditingStep: (index: number | null) => void;
  
  // Scenario functions
  updateScenario: (updates: Partial<EnhancedScenario>) => void;
  generateAIScenario: (prompt: string) => Promise<void>;
  generateFromTemplate: (templateId: string, prompt: string) => Promise<void>;
  loadTemplateScenario: (templateId: string) => void;
  generateCode: () => Promise<void>;
  resetEditor: () => void;
  
  // Templates
  setSelectedTemplateId: (id: string) => void;
}

export function useScenarioEditor({
  existingScenario,
  mode = 'create',
  onComplete
}: UseScenarioEditorProps): UseScenarioEditorReturn {
  // App store access
  const { getCurrentWorkspace } = useAppStore();
  const workspace = getCurrentWorkspace();
  
  // LLM service
  const { llmService, isLoading: isLlmLoading, error: llmError } = useLlmService();
  
  // States
  const [scenario, setScenario] = useState<EnhancedScenario>({
    id: '',
    name: '',
    description: '',
    icon: 'folder-kanban',
    steps: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult>({ valid: true, errors: [] });
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  
  // Get available scenarios from workspace
  const availableTemplates = workspace?.scenarios || [];
  
  // Initialize from existing scenario in edit mode
  useEffect(() => {
    if (mode === 'edit' && existingScenario) {
      const enhancedScenario = convertToEnhancedScenario(existingScenario);
      setScenario(enhancedScenario);
      setSelectedTemplateId(existingScenario.id);
    }
  }, [existingScenario, mode]);
  
  // Update error state from LLM service
  useEffect(() => {
    if (llmError) {
      setError(llmError);
    }
  }, [llmError]);
  
  // Reset editor
  const resetEditor = useCallback(() => {
    setScenario({
      id: '',
      name: '',
      description: '',
      icon: 'folder-kanban',
      steps: []
    });
    setGeneratedCode('');
    setError(null);
    setHasChanges(false);
    setValidationResult({ valid: true, errors: [] });
    setEditingStepIndex(null);
  }, []);
  
  // Update scenario properties
  const updateScenario = useCallback((updates: Partial<EnhancedScenario>) => {
    setScenario(prev => ({ ...prev, ...updates }));
    setHasChanges(true);
  }, []);
  
  // Add a new step
  const addStep = useCallback((type: StepData['tplFile']) => {
    setScenario(prev => {
      const prevStep = prev.steps.length > 0 ? prev.steps[prev.steps.length - 1] : undefined;
      const newStep = createDefaultStep(type, prev.steps.length, prevStep);
      return {
        ...prev,
        steps: [...prev.steps, newStep]
      };
    });
    setEditingStepIndex(scenario.steps.length);
    setHasChanges(true);
  }, [scenario.steps.length]);
  
  // Update an existing step
  const updateStep = useCallback((index: number, updates: Partial<StepData>) => {
    setScenario(prev => {
      const updatedSteps = [...prev.steps];
      updatedSteps[index] = { ...updatedSteps[index], ...updates };
      return { ...prev, steps: updatedSteps };
    });
    setHasChanges(true);
  }, []);
  
  // Remove a step
  const removeStep = useCallback((index: number) => {
    setScenario(prev => {
      const newSteps = [...prev.steps];
      newSteps.splice(index, 1);
      return { ...prev, steps: reorderSteps(newSteps) };
    });
    
    if (editingStepIndex === index) {
      setEditingStepIndex(null);
    } else if (editingStepIndex !== null && editingStepIndex > index) {
      setEditingStepIndex(editingStepIndex - 1);
    }
    
    setHasChanges(true);
  }, [editingStepIndex]);
  
  // Move a step up or down
  const moveStep = useCallback((index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === scenario.steps.length - 1)) {
      return; // Can't move first step up or last step down
    }
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    setScenario(prev => {
      const newSteps = [...prev.steps];
      [newSteps[index], newSteps[newIndex]] = [newSteps[newIndex], newSteps[index]];
      return { ...prev, steps: reorderSteps(newSteps) };
    });
    
    // Update editing index if needed
    if (editingStepIndex === index) {
      setEditingStepIndex(newIndex);
    } else if (editingStepIndex === newIndex) {
      setEditingStepIndex(index);
    }
    
    setHasChanges(true);
  }, [scenario.steps.length, editingStepIndex]);
  
  // Generate a scenario using AI
  const generateAIScenario = useCallback(async (prompt: string) => {
    if (!prompt.trim()) {
      setError('Please provide a description for the scenario');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const generatedScenario = await generateScenarioWithAI(prompt, llmService);
      setScenario(generatedScenario);
      setHasChanges(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [llmService]);
  
  // Generate a scenario from template using AI
  const generateFromTemplate = useCallback(async (templateId: string, prompt: string) => {
    if (!templateId || !prompt.trim()) {
      setError('Please select a template and provide a description');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const templateScenario = availableTemplates.find(s => s.id === templateId);
      if (!templateScenario) {
        throw new Error('Selected template not found');
      }
      
      const templateEnhanced = convertToEnhancedScenario(templateScenario);
      const generatedScenario = await generateScenarioWithAI(prompt, llmService, templateEnhanced);
      
      setScenario(generatedScenario);
      setHasChanges(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [availableTemplates, llmService]);
  
  // Load a scenario template
  const loadTemplateScenario = useCallback((templateId: string) => {
    if (!templateId) return;
    
    const template = availableTemplates.find(s => s.id === templateId);
    if (!template) return;
    
    const enhancedTemplate = convertToEnhancedScenario(template);
    
    // Create a new scenario based on the template
    setScenario({
      ...enhancedTemplate,
      id: '', // Will be generated during code generation
      name: `New ${enhancedTemplate.name}`,
      description: enhancedTemplate.description
    });
    
    setHasChanges(true);
  }, [availableTemplates]);
  
  // Generate the scenario code
  const generateCode = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate the scenario
      const result = validateScenario(scenario);
      setValidationResult(result);
      
      if (!result.valid) {
        setError('Please fix validation errors before generating code');
        return;
      }
      
      // Generate TypeScript code
      const code = generateScenarioImplementation(scenario);
      setGeneratedCode(code);
      
      // Generate initial context code
      const contextCode = generateInitialContextCode(scenario);
      
      // Call completion handler if provided
      if (onComplete) {
        onComplete(code, contextCode);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  }, [scenario, onComplete]);
  
  return {
    // State
    scenario,
    isLoading: isLoading || isLlmLoading,
    error,
    generatedCode,
    hasChanges,
    validationResult,
    editingStepIndex,
    availableTemplates,
    selectedTemplateId,
    
    // Step functions
    addStep,
    updateStep,
    removeStep,
    moveStep,
    setEditingStep: setEditingStepIndex,
    
    // Scenario functions
    updateScenario,
    generateAIScenario,
    generateFromTemplate,
    loadTemplateScenario,
    generateCode,
    resetEditor,
    
    // Templates
    setSelectedTemplateId
  };
}