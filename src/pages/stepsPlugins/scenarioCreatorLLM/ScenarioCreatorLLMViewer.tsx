/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/scenarioCreatorLLM/ScenarioCreatorLLMViewer.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw, Play, CheckCircle2 } from 'lucide-react';
import { ViewerProps } from '../types';
import { ConversationItem } from '@/types';
import { registerPluginHandler, unregisterPluginHandler } from '../pluginHandlers';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import ScenarioBuilderService from './service/ScenarioBuilderService';
import LLMService from './service/LLMService';


export function ScenarioCreatorLLMViewer({ step, onComplete }: ViewerProps) {
  const [llmResponse, setLlmResponse] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [creationStatus, setCreationStatus] = useState<string>('idle');
  const [prompt, setPrompt] = useState<string>('');
  const [results, setResults] = useState<{ 
    scenarios: any[], 
    tasks: any[], 
    steps: any[] 
  }>({ scenarios: [], tasks: [], steps: [] });

  // Get configuration with defaults
  const config = step.config || {};
  const projectPrefix = config.projectPrefix || 'LLM Campaign';
  const inputPrompt = config.inputPrompt || '';
  const mockResponse = config.mockResponse !== undefined ? config.mockResponse : true;

  // Initialize the prompt from config
  useEffect(() => {
    if (inputPrompt) {
      setPrompt(inputPrompt);
    }
  }, [inputPrompt]);

  // Call the LLM Service to get response
  const fetchFromLLM = async () => {
    setLoading(true);
    setError(null);
    
    console.log("[DEBUG] Fetching from LLM, mockResponse:", mockResponse);
    
    try {
      // Use the LLM service instead of direct API call
      const response = await LLMService.generateContent({
        prompt,
        useMock: mockResponse,
        userId: "user123"
      });
      
      setLlmResponse(response);
    } catch (err) {
      console.error("[DEBUG] Error in fetchFromLLM:", err);
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
    } catch (error) {
      console.error("Error creating elements:", error);
      setError(`Error creating content: ${(error as Error).message}`);
      setCreationStatus('error');
    }
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
      
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Prompt for LLM</label>
          <Textarea 
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what type of scenarios you want to generate"
            disabled={loading || creationStatus === 'processing'}
            className="min-h-[100px]"
          />
          <p className="text-xs text-muted-foreground">
            The prompt will be sent to the LLM to generate scenarios, tasks, and steps
          </p>
        </div>
        
        {/* Display current mode */}
        <Alert  className="bg-blue-50">
          <div className="text-sm">
            <span className="font-medium">Current mode: </span>
            {mockResponse ? "Using mock data" : "Using LLM API"}
          </div>
        </Alert>
        
        {llmResponse && (
          <div className="border rounded-md p-4 bg-muted/20">
            <h3 className="text-sm font-medium mb-2">LLM Generated Content Preview</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Scenarios:</span> {llmResponse.scenarios.length}
              </div>
              <div>
                <span className="font-medium">Tasks:</span> {(llmResponse.tasks || []).length}
              </div>
              <div>
                <span className="font-medium">Steps:</span> {(llmResponse.steps || []).length}
              </div>
            </div>
          </div>
        )}
        
        {creationStatus === 'completed' && (
          <Alert className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Successfully created {results.scenarios.length} scenarios, 
              {results.tasks.length} tasks, and 
              {results.steps.length} steps.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={fetchFromLLM}
          disabled={loading || creationStatus === 'processing'}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
        
        <Button 
          onClick={handleCreateAll}
          disabled={loading || !llmResponse || creationStatus === 'processing' || creationStatus === 'completed'}
        >
          {creationStatus === 'processing' ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Creating...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Create All
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}