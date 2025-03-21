/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/marketing-strategy/MarketingStrategyProcessor.tsx
import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  User, 
  BarChart, 
  Target, 
  LineChart, 
  Check,
  AlertCircle 
} from "lucide-react";
import { useFlowPlayer } from "@/modules/flowPlayer";
import { useWorkspaceContext } from "../../modules/context/hooks/useContext";
import { useAppStore } from "../../modules/store";
import { memo } from "react";
import { authService } from "../../services/authService";
import { useAuthState } from "../../hooks/useAuthState";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {  Position } from "../../modules/types";

interface MarketingScenario {
  name: string;
  description: string;
  nodes: {
    label: string;
    assistant: string;
    position?: Position;
  }[];
  edges: {
    source: number;
    target: number;
    label?: string;
  }[];
}

export const MarketingStrategyProcessor: React.FC = memo(() => {
  // Get state and methods from context
  const { 
    currentNode, 
    isNodeProcessed, 
    markNodeAsProcessed,
    nextNode
  } = useFlowPlayer();
  
  const { processTemplate } = useWorkspaceContext();
  const { 
    addToConversation, 
    addScenario, 
    addNode, 
    addEdge, 
    selected 
  } = useAppStore();
  const { user, backendUser } = useAuthState();
  
  // State management
  const processedNodeRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [generatedSuccess, setGeneratedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Process assistant message when node changes
  useEffect(() => {
    if (
      !currentNode || 
      !currentNode.assistant || 
      isNodeProcessed(currentNode.id) || 
      processedNodeRef.current === currentNode.id
    ) {
      return;
    }
    
    // Set refs to prevent duplicate processing
    processedNodeRef.current = currentNode.id;
    
    // Mark node as processed immediately
    markNodeAsProcessed(currentNode.id);
    
    // Process template based on context variables
    const processedMessage = processTemplate(currentNode.assistant);
    
    // Add to conversation
    addToConversation({
      role: "assistant",
      message: processedMessage
    });
  }, [
    currentNode?.id, 
    currentNode?.assistant, 
    isNodeProcessed, 
    markNodeAsProcessed,
    processTemplate,
    addToConversation
  ]);

  // Return null if no current node
  if (!currentNode) {
    return null;
  }
  
  // Get plugin options
  const options = currentNode.plugin === "marketing-strategy" && currentNode.pluginOptions
    ? currentNode.pluginOptions["marketing-strategy"] || {}
    : {};
  
  // Get plugin settings
  const strategyType = options.strategy_type || "general_strategy";
  const targetAudience = options.target_audience || "General consumers";
  const budgetRange = options.budget_range || "medium";
  const businessType = options.business_type || "E-commerce";
  const scenariosCount = parseInt(options.scenarios_count || "2");
  
  // Get strategy type label
  const getStrategyTypeLabel = () => {
    switch(strategyType) {
      case "general_strategy": return "General Marketing Strategy Process";
      case "adwords_campaign": return "Google AdWords Campaign";
      case "results_analysis": return "Marketing Results Analysis";
      default: return "Marketing Strategy";
    }
  };
  
  // Get strategy icon
  const StrategyIcon = () => {
    switch(strategyType) {
      case "general_strategy": return <Target className="h-4 w-4 mr-2" />;
      case "adwords_campaign": return <BarChart className="h-4 w-4 mr-2" />;
      case "results_analysis": return <LineChart className="h-4 w-4 mr-2" />;
      default: return <Target className="h-4 w-4 mr-2" />;
    }
  };
  
  // Process message for display
  const displayMessage = currentNode.assistant
    ? processTemplate(currentNode.assistant)
    : "";
  
  // Generate a prompt for the API based on strategy type
  const generatePrompt = () => {
    const commonInfo = `
Business Type: ${businessType}
Target Audience: ${targetAudience}
Budget Range: ${budgetRange}
    `;
    
    switch(strategyType) {
      case "general_strategy":
        return `Generate ${scenariosCount} detailed marketing strategy process scenarios for:
${commonInfo}

Each scenario should have a unique name, description, and 5-7 major steps.
For each step, provide:
1. A short label/title
2. A detailed description of actions to take

Format the response as a JSON object with this structure:
{
  "scenarios": [
    {
      "name": "Scenario Name",
      "description": "Brief scenario description",
      "nodes": [
        {
          "label": "Step Title",
          "assistant": "Detailed step description"
        }
      ],
      "edges": [
        {
          "source": 0,
          "target": 1
        }
      ]
    }
  ]
}

The nodes array should include all steps in the process. The edges array should connect the nodes in sequence.`;

      case "adwords_campaign":
        return `Generate ${scenariosCount} step-by-step Google AdWords campaign scenarios for:
${commonInfo}

Each scenario should have a unique name, description, and 5-8 implementation steps.
For each step, provide:
1. A short label/title
2. A detailed description of what to do in that phase

Format the response as a JSON object with this structure:
{
  "scenarios": [
    {
      "name": "Campaign Name",
      "description": "Campaign approach description",
      "nodes": [
        {
          "label": "Step Title",
          "assistant": "Detailed step description"
        }
      ],
      "edges": [
        {
          "source": 0,
          "target": 1
        }
      ]
    }
  ]
}

The nodes array should include all steps in the campaign process. The edges array should connect the nodes in sequential order.`;

      case "results_analysis":
        return `Generate ${scenariosCount} marketing results analysis frameworks for:
${commonInfo}

Each framework should have a unique name, description, and 5-7 analysis phases.
For each phase, provide:
1. A short label/title
2. A detailed description of the analysis approach and KPIs to monitor

Format the response as a JSON object with this structure:
{
  "scenarios": [
    {
      "name": "Analysis Framework Name",
      "description": "Framework overview",
      "nodes": [
        {
          "label": "Phase Title",
          "assistant": "Detailed analysis description"
        }
      ],
      "edges": [
        {
          "source": 0,
          "target": 1
        }
      ]
    }
  ]
}

The nodes array should include all analysis phases. The edges array should connect the nodes in logical order.`;

      default:
        return `Generate ${scenariosCount} marketing strategy scenarios for:
${commonInfo}`;
    }
  };
  
  // Create scenarios based on API response
  const createScenariosFromResponse = (responseData: any) => {
    try {
      // Check if we got a valid scenarios array
      if (!responseData.scenarios || !Array.isArray(responseData.scenarios)) {
        throw new Error("Invalid response format: missing scenarios array");
      }
      
      // Keep track of the new scenario IDs
      const newScenarioIds: string[] = [];
      
      // Process each scenario
      responseData.scenarios.forEach((scenario: MarketingScenario) => {
        // Add the scenario to the workspace
        const scenarioPayload = {
          name: scenario.name,
          description: scenario.description
        };
        
        // Add new scenario (we can't directly access the ID it generates)
        addScenario(scenarioPayload);
        
        // This is a workaround to get the new scenario ID
        // We need to find the newly created scenario in the updated state
        const currentState = useAppStore.getState();
        const workspace = currentState.items.find(w => w.id === selected.workspace);
        const scenarios = workspace?.children || [];
        
        // Find the newest scenario (assuming it was just added and has the highest updatedAt value)
        const newScenario = [...scenarios].sort((a, b) => 
          (b.updatedAt || 0) - (a.updatedAt || 0)
        )[0];
        
        if (newScenario) {
          const scenarioId = newScenario.id;
          newScenarioIds.push(scenarioId);
          
          // Generate node positions in a flow layout
          const nodePositions: Position[] = scenario.nodes.map((_, index) => ({
            x: 100 + (index % 3) * 250,
            y: 100 + Math.floor(index / 3) * 250
          }));
          
          // Track created node IDs to use for edge creation
          const createdNodeIds: string[] = [];
          
          // Create all the nodes
          scenario.nodes.forEach((node, index) => {
            const nodePayload = {
              label: node.label,
              assistant: node.assistant,
              position: nodePositions[index]
            };
            
            // Add new node
            addNode(nodePayload);
            
            // Get the newly created node ID using the same approach
            const updatedState = useAppStore.getState();
            const updatedScenario = updatedState.getCurrentScenario();
            
            if (updatedScenario && updatedScenario.children) {
              // Find the newest node
              const newNode = [...updatedScenario.children].sort((a, b) => 
                a.id.localeCompare(b.id)
              ).pop();
              
              if (newNode) {
                createdNodeIds.push(newNode.id);
              }
            }
          });
          
          // Create all the edges
          scenario.edges.forEach(edge => {
            if (
              edge.source >= 0 && 
              edge.source < createdNodeIds.length && 
              edge.target >= 0 && 
              edge.target < createdNodeIds.length
            ) {
              const edgePayload = {
                source: createdNodeIds[edge.source],
                target: createdNodeIds[edge.target],
                label: edge.label
              };
              
              // Add the edge
              addEdge(edgePayload);
            }
          });
        }
      });
      
      // Update status
      setGeneratedSuccess(true);
      
      return newScenarioIds;
    } catch (err) {
      console.error("Error creating scenarios:", err);
      throw err;
    }
  };
  
  // API call function
  const generateStrategies = async () => {
    setIsLoading(true);
    setApiResponse(null);
    setGeneratedSuccess(false);
    setError(null);
    
    try {
      // Get authentication token
      const authToken = user ? await authService.getCurrentUserToken() : null;
      
      // Get API URL from environment variable
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const apiUrl = `${apiBaseUrl}/api/v1/services/chat/completion`;
      
      // Generate prompt based on strategy type
      const prompt = generatePrompt();
      
      // Make API call
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {})
        },
        body: JSON.stringify({
          messages: [
            { role: "user", content: prompt }
          ],
          userId: user?.uid || "user123"
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store raw API response
      setApiResponse(JSON.stringify(data, null, 2));
      
      // Process response
      if (data?.success && data?.data?.message?.content) {
        const content = data.data.message.content;
        
        // Try to extract JSON from the response content
        let scenariosData;
        try {
          // Check if the content is already JSON
          if (typeof content === 'object') {
            scenariosData = content;
          } else {
            // Try to extract JSON from the text
            const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                              content.match(/{[\s\S]*}/);
            
            if (jsonMatch) {
              scenariosData = JSON.parse(jsonMatch[0].replace(/```json|```/g, ''));
            } else {
              // If no JSON found, just use the raw content
              throw new Error("Could not extract JSON from response");
            }
          }
          
          // Create scenarios from the parsed data
          const newScenarioIds = createScenariosFromResponse(scenariosData);
          
          // Add success message to conversation
          addToConversation({
            role: "assistant",
            message: `Successfully generated ${newScenarioIds.length} marketing strategy scenarios. You can view them in your workspace.`
          });
          
          // Move to next node if there is one
          nextNode("Strategy generation completed");
          
        } catch (jsonError) {
          console.error("JSON parsing error:", jsonError);
          
          // Add error message to conversation
          addToConversation({
            role: "assistant",
            message: `Error parsing the generated scenarios: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`
          });
          
          setError(`Error parsing the generated scenarios: ${jsonError instanceof Error ? jsonError.message : String(jsonError)}`);
        }
      } else {
        throw new Error("Invalid API response format");
      }
    } catch (error) {
      console.error("API error:", error);
      setApiResponse(`Error: ${error instanceof Error ? error.message : String(error)}`);
      setError(`Strategy generation failed: ${error instanceof Error ? error.message : String(error)}`);
      
      // Add error to conversation
      addToConversation({
        role: "assistant",
        message: `Error: ${error instanceof Error ? error.message : String(error)}`
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="assistant-message-processor border shadow-none mb-3">
      <CardContent className="pt-3 px-4">
        <div className="mb-2">
          <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-full">
            Assistant
          </span>
          <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 px-2 py-1 rounded-full ml-2">
            Marketing Strategy Generator
          </span>
        </div>
        
        {/* User information */}
        {user && (
          <div className="bg-gray-50 dark:bg-gray-900/30 p-3 rounded-md border border-gray-200 dark:border-gray-800 mb-3">
            <div className="flex items-center">
              <User className="h-4 w-4 mr-2 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium">Logged in as:</span>
            </div>
            <div className="mt-1 text-xs">
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>User ID:</strong> {user.uid}</div>
              {backendUser && (
                <div className="mt-1">
                  <div><strong>Available Tokens:</strong> {backendUser.availableTokens}</div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Strategy configuration summary */}
        <div className="mb-3 bg-gray-50 dark:bg-gray-900/30 p-3 rounded-md border border-gray-200 dark:border-gray-800">
          <div className="flex items-center text-sm font-medium mb-2">
            <StrategyIcon />
            {getStrategyTypeLabel()}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><strong>Business Type:</strong> {businessType}</div>
            <div><strong>Target Audience:</strong> {targetAudience}</div>
            <div><strong>Budget Range:</strong> {budgetRange}</div>
            <div><strong>Scenarios to Generate:</strong> {scenariosCount}</div>
          </div>
        </div>
        
        {/* Display message */}
        <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-md border border-blue-200 dark:border-blue-900/50 min-h-[100px] mb-3">
          {displayMessage ? (
            <p className="whitespace-pre-wrap text-sm">{displayMessage}</p>
          ) : (
            <p className="text-muted-foreground italic text-sm">This node has no assistant message.</p>
          )}
        </div>
        
        {/* Success message */}
        {generatedSuccess && (
          <Alert className="mb-3 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-900/50">
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              Successfully generated marketing strategy scenarios. Check your workspace to view them.
            </AlertDescription>
          </Alert>
        )}
        
        {/* Error message */}
        {error && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}
        
        {/* API response (if any) */}
        {apiResponse && (
          <div className="bg-gray-50 dark:bg-gray-900/20 p-4 rounded-md border border-gray-200 dark:border-gray-800 mb-3 overflow-auto max-h-60">
            <Badge className="mb-2">API Response</Badge>
            <pre className="text-xs whitespace-pre-wrap">{apiResponse}</pre>
          </div>
        )}
        
        {/* API call button */}
        <div className="flex justify-end">
          <Button
            onClick={generateStrategies}
            disabled={isLoading}
            className={`bg-blue-500 hover:bg-blue-600 text-white transition-all ${isLoading ? "bg-gray-400 cursor-not-allowed" : ""}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                Generate Marketing Strategies
                <BarChart className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
});

MarketingStrategyProcessor.displayName = 'MarketingStrategyProcessor';