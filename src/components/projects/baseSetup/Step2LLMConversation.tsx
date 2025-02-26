/* eslint-disable @typescript-eslint/no-explicit-any */
// Step2LLMConversation.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, User } from "lucide-react";
import { useProjectStore } from "@/store/projectStore";
import { useAuthState } from "@/hooks/useAuthState";
import { IGeneratedSetup } from "@/utils/projects/projectTypes";
import llmService from "@/services/setupLLMService/llmService";
import { tokenService } from "@/services/tokenService";

// Props to communicate with parent component
interface Step2Props {
  onGeneratedSetup: (setup: IGeneratedSetup) => void;
  onSetCurrentStep: (step: number) => void;
}

export const Step2LLMConversation: React.FC<Step2Props> = ({
  onGeneratedSetup,
  onSetCurrentStep
}) => {
  const { user } = useAuthState();
  
  // Use project store directly
  const currentProject = useProjectStore((state) => state.currentProject);

  // Local state
  const [projectIntent, setProjectIntent] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Generate setup from LLM
  const generateSetup = async () => {
    if (!projectIntent.trim() || !currentProject) return;
    
    setIsGenerating(true);
    setErrorMessage(null);
    
    try {
      // Check if user is available
      if (!user) {
        setErrorMessage("User not authenticated. Please log in.");
        setIsGenerating(false);
        return;
      }
      
      // Get token using tokenService
      const token = await tokenService.getToken(user);
      
      // Check if we have a valid token
      if (!token) {
        setErrorMessage("Authentication token not available. Please log in again.");
        setIsGenerating(false);
        return;
      }
      
      // Configure the auth header in the llmService
      if (llmService instanceof Object) {
        // Set auth header configuration
        if ('setAuthToken' in llmService) {
          (llmService as any).setAuthToken(token);
        }
        
        // Alternatively, if the service uses headers directly
        if ('setHeaders' in llmService) {
          (llmService as any).setHeaders({
            'Authorization': `Bearer ${token}`
          });
        }
      }
      
      // Make API call to the LLM service
      const response = await llmService.generateProjectSetup(
        currentProject.name,
        currentProject.description || "",
        projectIntent
      );
      
      onGeneratedSetup(response);
      onSetCurrentStep(2); // Move to review step
    } catch (error) {
      console.error("Failed to generate setup:", error);
      
      // Check for specific error type
      if (error && typeof error === 'object' && 'success' in error && error.success === false) {
        const errorObj = (error as any).error || {};
        setErrorMessage(`Authentication error: ${errorObj.message || "Missing authorization token"}. Please log in again.`);
      } else {
        setErrorMessage("Failed to generate project setup. Please try again or modify your description.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Describe Your Project for AI</CardTitle>
          <CardDescription>
            Describe what you need, and the AI will generate an appropriate structure of tasks, templates, and containers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Display user ID and token status */}
          <div className="flex items-center mb-4 text-sm bg-muted p-2 rounded-md">
            <User className="h-4 w-4 mr-2" />
            <div className="flex flex-col">
              <span>User ID: <span className="font-mono">{user?.uid || "Not logged in"}</span></span>
              <span className="text-xs text-muted-foreground">
                Token status: {user ? "Available via tokenService" : "Not available"}
              </span>
            </div>
            {user && (
              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-800">
                Authenticated
              </span>
            )}
            {!user && (
              <span className="ml-auto px-2 py-0.5 text-xs rounded-full bg-red-100 text-red-800">
                Not Authenticated
              </span>
            )}
          </div>
        
          <Textarea
            value={projectIntent}
            onChange={(e) => setProjectIntent(e.target.value)}
            placeholder="E.g., I want to create a marketing campaign management system where I'll store campaign materials, plan tasks, and analyze results."
            className="min-h-[200px] mb-4"
          />
          <div className="text-sm text-muted-foreground mb-4">
            <p>Examples of effective descriptions:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>I need a system for managing research documents and data analysis</li>
              <li>I want to create a marketing campaign planning system with task templates</li>
              <li>I need to organize client documents and related project tasks</li>
            </ul>
          </div>
          
          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            onClick={generateSetup}
            disabled={!projectIntent.trim() || isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Setup"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};