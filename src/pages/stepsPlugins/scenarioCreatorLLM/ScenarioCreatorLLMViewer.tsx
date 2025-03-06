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

// Mock LLM response with rich task and step data
const MOCK_LLM_RESPONSE = {
  scenarios: [
    {
      id: "scenario-1",
      title: "Content Strategy Development",
      description: "Create a comprehensive content plan targeting key audience segments.",
      objective: "Increase organic traffic by 30% in 3 months",
      connections: ["scenario-2", "scenario-3"]
    },
    {
      id: "scenario-2",
      title: "Social Media Campaign",
      description: "Launch coordinated campaigns across Instagram, Twitter, and LinkedIn.",
      objective: "Achieve 15% engagement rate and 5000 new followers",
      connections: ["scenario-1"]
    },
    {
      id: "scenario-3",
      title: "Analytics Implementation",
      description: "Set up tracking and reporting for all marketing initiatives.",
      objective: "Create real-time KPI dashboard for executive team",
      connections: ["scenario-1", "scenario-2"]
    }
  ],
  tasks: [
    {
      scenarioRef: "scenario-1",
      title: "Audience Research",
      description: "Conduct comprehensive research on target audience segments",
      priority: "high"
    },
    {
      scenarioRef: "scenario-1",
      title: "Content Calendar",
      description: "Develop monthly content calendar with themes and topics",
      priority: "medium"
    },
    {
      scenarioRef: "scenario-1",
      title: "Editorial Guidelines",
      description: "Create brand voice and style guidelines for content creation",
      priority: "medium"
    },
    {
      scenarioRef: "scenario-2",
      title: "Platform Audit",
      description: "Audit current social media presence and performance",
      priority: "medium"
    },
    {
      scenarioRef: "scenario-2",
      title: "Campaign Creative",
      description: "Design visual assets and copy for social media posts",
      priority: "high"
    },
    {
      scenarioRef: "scenario-2",
      title: "Engagement Strategy",
      description: "Develop plan for community management and engagement",
      priority: "low"
    },
    {
      scenarioRef: "scenario-3",
      title: "Analytics Setup",
      description: "Configure Google Analytics and social tracking pixels",
      priority: "high"
    },
    {
      scenarioRef: "scenario-3",
      title: "Dashboard Creation",
      description: "Build executive dashboard with key performance metrics",
      priority: "medium"
    }
  ],
  steps: [
    {
      taskRef: "Audience Research",
      title: "Demographic Analysis",
      description: "Analyze demographic data of current customers",
      type: "text-input"
    },
    {
      taskRef: "Audience Research",
      title: "Competitor Analysis",
      description: "Research competitors' audience targeting strategies",
      type: "text-input"
    },
    {
      taskRef: "Audience Research",
      title: "Persona Development",
      description: "Create detailed buyer personas based on research",
      type: "step-reference"
    },
    {
      taskRef: "Content Calendar",
      title: "Theme Development",
      description: "Brainstorm monthly content themes aligned with business goals",
      type: "text-input"
    },
    {
      taskRef: "Content Calendar",
      title: "Content Types Definition",
      description: "Define mix of content types (blog, video, social, etc.)",
      type: "simple-plugin"
    },
    {
      taskRef: "Editorial Guidelines",
      title: "Tone & Voice Document",
      description: "Document brand voice characteristics and examples",
      type: "text-input"
    },
    {
      taskRef: "Editorial Guidelines",
      title: "Style Guide Creation",
      description: "Compile comprehensive style guide for all content creators",
      type: "text-input"
    },
    {
      taskRef: "Platform Audit",
      title: "Performance Review",
      description: "Document current engagement metrics across all platforms",
      type: "text-input"
    },
    {
      taskRef: "Platform Audit",
      title: "Competitive Analysis",
      description: "Analyze competitor social media strategies and performance",
      type: "text-input"
    },
    {
      taskRef: "Campaign Creative",
      title: "Visual Style Guide",
      description: "Create guidelines for campaign visual identity",
      type: "simple-plugin"
    },
    {
      taskRef: "Campaign Creative",
      title: "Copy Development",
      description: "Write copy templates for different post types",
      type: "text-input"
    },
    {
      taskRef: "Engagement Strategy",
      title: "Response Guidelines",
      description: "Create community management response guidelines",
      type: "text-input"
    },
    {
      taskRef: "Analytics Setup",
      title: "Conversion Tracking",
      description: "Set up conversion tracking for key business objectives",
      type: "text-input"
    },
    {
      taskRef: "Analytics Setup",
      title: "Custom Events",
      description: "Configure custom event tracking for user interactions",
      type: "simple-plugin"
    },
    {
      taskRef: "Dashboard Creation",
      title: "Metrics Definition",
      description: "Define KPIs and metrics to include in dashboard",
      type: "text-input"
    },
    {
      taskRef: "Dashboard Creation",
      title: "Dashboard Building",
      description: "Construct interactive dashboard with data visualizations",
      type: "step-reference"
    }
  ]
};

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

  const { projectPrefix = 'LLM Campaign', inputPrompt = '', mockResponse = true } = step.config || {};

  // Initialize the prompt from config
  useEffect(() => {
    if (inputPrompt) {
      setPrompt(inputPrompt);
    }
  }, [inputPrompt]);

  // Simulate LLM call
  const fetchFromLLM = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call to the LLM
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      
      if (mockResponse) {
        setLlmResponse(MOCK_LLM_RESPONSE);
      } else {
        // Here you would make a real API call to an LLM service
        // For now, we'll just use the mock data
        setLlmResponse(MOCK_LLM_RESPONSE);
      }
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
        
        {llmResponse && (
          <div className="border rounded-md p-4 bg-muted/20">
            <h3 className="text-sm font-medium mb-2">LLM Generated Content Preview</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Scenarios:</span> {llmResponse.scenarios.length}
              </div>
              <div>
                <span className="font-medium">Tasks:</span> {llmResponse.tasks.length}
              </div>
              <div>
                <span className="font-medium">Steps:</span> {llmResponse.steps.length}
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