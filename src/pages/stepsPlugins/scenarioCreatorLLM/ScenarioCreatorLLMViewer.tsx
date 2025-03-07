/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/ScenarioCreatorLLMViewer.tsx
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ConversationItem } from '@/types';
import { registerPluginHandler, unregisterPluginHandler } from '../pluginHandlers';

import { useAuthState } from '@/hooks/useAuthState';
import { useToast } from '@/hooks/useToast';
import { ViewerProps } from '../types';

// Import component parts
import { PromptInput } from './components/PromptInput';
import { ResponsePreview } from './components/ResponsePreview';
import { ActionButtons } from './components/ActionButtons';
import { CurrentMode } from './components/CurrentMode';
import { ErrorDisplay } from './components/ErrorDisplay';

// Import services
import ScenarioBuilderService from './service/ScenarioBuilderService';
import LLMService from './service/LLMService';
import { LLMDocumentService } from './service/LLMDocumentService';

export function ScenarioCreatorLLMViewer({ step, onComplete }: ViewerProps) {
  const [llmResponse, setLlmResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [creationStatus, setCreationStatus] = useState<string>('idle');
  const [saveStatus, setSaveStatus] = useState<string>('idle');
  const [prompt, setPrompt] = useState<string>('');
  const [results, setResults] = useState<{ 
    scenarios: any[], 
    tasks: any[], 
    steps: any[] 
  }>({ scenarios: [], tasks: [], steps: [] });
  
  // Get authenticated user information
  const { user, loading: authLoading } = useAuthState();
  const { toast } = useToast();

  // Get configuration with defaults
  const config = step.config || {};
  const projectPrefix = config.projectPrefix || 'LLM Campaign';
  const inputPrompt = config.inputPrompt || '';
  const mockResponse = config.mockResponse !== undefined ? config.mockResponse : true;
  const domainContext = config.domainContext || 'marketing';
  const customSystemPrompt = config.customSystemPrompt || '';
  const numberOfScenarios = config.numberOfScenarios || 3;
  const enableAutoSave = config.enableAutoSave !== undefined ? config.enableAutoSave : true;

  // Determine if custom domain is being used
  const isDomainCustom = domainContext === 'custom' && !!customSystemPrompt;

  // Initialize the prompt from config
  useEffect(() => {
    if (inputPrompt) {
      setPrompt(inputPrompt);
    }
  }, [inputPrompt]);

  // Get authentication token
  const getAuthToken = useCallback(async () => {
    try {
      if (!user) return null;
      return await user.getIdToken();
    } catch (err) {
      console.error("Error getting auth token:", err);
      return null;
    }
  }, [user]);

  // Call the LLM Service to get response with either the current prompt or a custom one
  const fetchFromLLM = async (customPrompt?: string) => {
    setLoading(true);
    setError(null);
    
    
    
    try {
      // Get auth token
      const token = await getAuthToken();
      
      // Use the LLM service with auth token
      const response = await LLMService.generateContent({
        prompt: customPrompt || prompt,
        useMock: mockResponse,
        userId: user?.uid || "anonymous",
        authToken: token,
        domainContext,
        customSystemPrompt,
        numberOfScenarios
      });
      
      setLlmResponse(response);
    } catch (err) {
      setError(`Error fetching from LLM: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create scenarios, tasks, and steps in the system
  const handleCreateAll = async () => {
    if (!llmResponse) {
      setError("No LLM response available. Generate content first.");
      return;
    }

    setCreationStatus('processing');
    
    try {
      // Use the ScenarioBuilderService to create everything
      const result = await ScenarioBuilderService.createFromLLMData(
        llmResponse, 
        projectPrefix
      );
      
      // Store the results
      setResults(result);
      
      // Create conversation data
      const conversationData: ConversationItem[] = [
        {
          role: "user",
          content: prompt
        },
        {
          role: "assistant",
          content: `Created ${result.scenarios.length} scenarios, ${result.tasks.length} tasks, and ${result.steps.length} steps successfully.`
        }
      ];
      
      // Complete the step
      onComplete({
        createdScenarios: result.scenarios,
        createdTasks: result.tasks,
        createdSteps: result.steps,
        timestamp: new Date().toISOString()
      }, conversationData);
      
      setCreationStatus('completed');

      // Auto-save to documents if enabled
      if (enableAutoSave) {
        await handleSaveToDocuments();
      }
    } catch (error) {
      console.error("Error creating elements:", error);
      setError(`Error creating content: ${(error as Error).message}`);
      setCreationStatus('error');
    }
  };
  
  // Save LLM response to documents
  const handleSaveToDocuments = async () => {
    if (!llmResponse) {
      setError("No LLM response available to save.");
      return;
    }
    
    setSaveStatus('processing');
    
    try {
      let result;
      
      // If we have created scenarios, save one document for each scenario
      if (results.scenarios.length > 0) {
        const scenarioIds = results.scenarios.map(s => s.id);
        result = LLMDocumentService.saveResponseToMultipleDocuments(
          llmResponse,
          prompt,
          scenarioIds
        );
        
        if (result.successCount > 0) {
          toast({
            title: "Success",
            description: `Saved LLM response to ${result.successCount} scenario document(s)`,
            variant: "default"
          });
          setSaveStatus('completed');
        } else {
          setError("Failed to save any documents: " + result.errors.join(", "));
          setSaveStatus('error');
        }
      } else {
        // Otherwise, save one document in the main scenarios folder
        result = LLMDocumentService.saveResponseToDocument(
          llmResponse,
          prompt,
          'scenarios' // Use the scenarios folder as default
        );
        
        if (result.success) {
          toast({
            title: "Success",
            description: "Saved LLM response to documents",
            variant: "default"
          });
          setSaveStatus('completed');
        } else {
          setError("Failed to save document: " + result.error);
          setSaveStatus('error');
        }
      }
    } catch (error) {
      console.error("Error saving to documents:", error);
      setError(`Error saving document: ${(error as Error).message}`);
      setSaveStatus('error');
    }
  };

  // Handle prompt submission from the PromptInput component
  const handlePromptSubmit = (newPrompt: string) => {
    setPrompt(newPrompt);
    fetchFromLLM(newPrompt);
  };
  
  // Register plugin handler
  useEffect(() => {
    const completeHandler = async () => {
      if (!llmResponse) {
        await fetchFromLLM();
      }
      
      await handleCreateAll();
    };
    
    registerPluginHandler(step.id, completeHandler);
    
    return () => {
      unregisterPluginHandler(step.id);
    };
  }, [step.id, llmResponse, prompt]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{step.title || 'LLM Scenario Creator'}</CardTitle>
        <CardDescription>
          {step.description || 'Generate scenarios, tasks, and steps using LLM'}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <ErrorDisplay error={error} />
        
        <PromptInput 
          initialPrompt={prompt}
          onSubmit={handlePromptSubmit}
          isDisabled={loading || creationStatus === 'processing'}
          isDomainCustom={isDomainCustom}
          domainContext={domainContext}
        />
        
        <CurrentMode 
          mockResponse={mockResponse}
          user={user}
          authLoading={authLoading}
        />
        
        {llmResponse && (
          <ResponsePreview 
            llmResponse={llmResponse}
            creationStatus={creationStatus}
            results={results}
          />
        )}
      </CardContent>
      
      <CardFooter>
        <ActionButtons 
          loading={loading}
          fetchFromLLM={() => fetchFromLLM()}
          handleCreateAll={handleCreateAll}
          handleSaveToDocuments={handleSaveToDocuments}
          llmResponse={llmResponse}
          creationStatus={creationStatus}
          saveStatus={saveStatus}
        />
      </CardFooter>
    </Card>
  );
}