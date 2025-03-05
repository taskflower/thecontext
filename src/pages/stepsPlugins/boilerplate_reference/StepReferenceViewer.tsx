/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/boilerplate_reference/StepReferenceViewer.tsx
import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { ViewerProps } from "../types";
import { ConversationItem } from "@/types";
import { registerPluginHandler, unregisterPluginHandler } from "../pluginHandlers";
import { getStepData } from "@/components/plugins/PreviousStepsSelect";

export function StepReferenceViewer({ step, onComplete }: ViewerProps) {
  const [referencedData, setReferencedData] = useState<any>(null);
  const [referencedStepTitle, setReferencedStepTitle] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  const { referenceStepId = "" } = step.config || {};

  // Fetch data from the referenced step
  const fetchReferencedData = () => {
    if (!referenceStepId) {
      setError("No reference step selected");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the encapsulated helper function to get step data
      const stepDataResult = getStepData(referenceStepId);
      
      if (stepDataResult.error) {
        throw new Error(stepDataResult.error);
      }
      
      setReferencedData(stepDataResult.data);
      setReferencedStepTitle(stepDataResult.title);
    } catch (err) {
      setError(`Error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load the data when the component mounts or the step reference changes
  useEffect(() => {
    fetchReferencedData();
  }, [referenceStepId]);

  // Format the data for display
  const formatData = (data: any): React.ReactNode => {
    if (data === null || data === undefined) {
      return <em>No data available</em>;
    }
    
    if (typeof data !== 'object') {
      return (
        <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[400px]">
          {data}
        </pre>
      );
    }
    
    // Attempt to render as a formatted display
    try {
      return (
        <div className="space-y-2">
          {Object.entries(data).map(([key, value]) => (
            <div key={key} className="border-b pb-2">
              <div className="font-bold text-sm">{key}</div>
              <div className="text-sm">
                {typeof value === 'object' ? (
                  <pre className="text-xs mt-1 whitespace-pre-wrap">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  String(value)
                )}
              </div>
            </div>
          ))}
        </div>
      );
    } catch {
      // Fall back to raw display if structured display fails
      return (
        <pre className="text-xs whitespace-pre-wrap overflow-auto max-h-[400px]">
          {JSON.stringify(data, null, 2)}
        </pre>
      );
    }
  };

  const handleComplete = () => {
    if (!referencedData) return;

    setIsCompleting(true);
    
    // Create conversation data
    const conversationData: ConversationItem[] = [
      {
        role: "user",
        content: `Reference data from step: ${referencedStepTitle}`
      },
      {
        role: "assistant",
        content: `Referenced data from "${referencedStepTitle}" successfully`
      }
    ];

    // Simulate a short delay to show loading state
    setTimeout(() => {
      onComplete({
        referencedData,
        referencedStepId: referenceStepId,
        referencedStepTitle,
        timestamp: new Date().toISOString()
      }, conversationData);
      
      setIsCompleting(false);
    }, 500);
  };

  // Register handler for the plugin handler system
  useEffect(() => {
    registerPluginHandler(step.id, handleComplete);
    
    // Clean up handler when component unmounts
    return () => {
      unregisterPluginHandler(step.id);
    };
  }, [step.id, referencedData]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{step.title || "Step Reference"}</CardTitle>
      </CardHeader>

      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          {step.description || "Displaying data from a previous step"}
        </p>

        {error ? (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : loading ? (
          <div className="flex justify-center items-center p-8 bg-muted rounded-md">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : referencedData ? (
          <div className="border rounded-md bg-muted/50">
            <div className=" font-medium  text-lg p-4 border-b">
              Data from: {referencedStepTitle}
            </div>
            <div className="p-4 ">
            {formatData(referencedData)}
            </div>
           
          </div>
        ) : (
          <div className="text-center p-8 text-muted-foreground">
            No data to display
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={fetchReferencedData}
          disabled={isCompleting}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Data
        </Button>

        <Button 
          onClick={handleComplete} 
          disabled={loading || !referencedData || isCompleting}
        >
          {isCompleting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Processing...
            </>
          ) : (
            "Complete"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}