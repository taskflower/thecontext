import React, { useState } from "react";
import { PluginRuntimeProps } from "../base";
import { WebPageAnalyserConfig, WebPageAnalyserRuntimeData } from "./types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentsStore } from "@/store/documentsStore";
import { useAuthState } from "@/hooks/useAuthState";
import { analyserModule } from "./runtimeModules/analyserModule";
import { documentModule } from "./runtimeModules/documentModule";
import { truncate } from "@/services/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader } from "lucide-react";

interface ApiError {
  code: string;
  message: string;
}

export const RuntimeComponent: React.FC<PluginRuntimeProps> = ({
  config,
  context,
  onDataChange,
  onStatusChange,
}) => {
  const analyserConfig = config as WebPageAnalyserConfig;
  const { addDocument, addContainer } = useDocumentsStore();
  const { user, loading } = useAuthState();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [error, setError] = useState<ApiError | null>(null);

  const startAnalysis = async () => {
    if (!analyserConfig.selectedStepId) {
      setError({
        code: 'STEP_REQUIRED',
        message: 'No step selected'
      });
      return;
    }

    if (!user) {
      setError({
        code: 'AUTH_REQUIRED',
        message: 'You must be logged in to analyze websites'
      });
      return;
    }

    setError(null);
    setIsAnalyzing(true);

    try {
      const selectedStep = context.previousSteps[0];
      const targetUrl = selectedStep?.data?.answer;
      
      if (!targetUrl) {
        throw {
          code: 'URL_NOT_FOUND',
          message: 'URL not found in selected step'
        };
      }

      // Using Analyser Module
      const result = await analyserModule.analyzeWebPage(
        analyserConfig.analysisType,
        targetUrl,
        user
      );

      if (!result.success || !result.content) {
        throw {
          code: 'INVALID_RESPONSE',
          message: 'Invalid API response format'
        };
      }

      setAnalysisResult(result.content);

      // Using Document Module
      documentModule.saveDocument(
        { addDocument, addContainer },
        analyserConfig.documentName,
        analyserConfig.containerName,
        result.content
      );

      const newData: WebPageAnalyserRuntimeData = {
        analysisResult: result.content,
        messages: [
          {
            role: "system",
            content: `Analysis started: ${analyserConfig.analysisType} for ${targetUrl}`,
          },
          {
            role: "assistant",
            content: result.content,
          },
        ],
      };
      
      onDataChange(newData);
      onStatusChange(true);
    } catch (error: unknown) {
      if (error && typeof error === 'object' && 'code' in error) {
        const apiError = error as ApiError;
        setError(apiError);
      } else {
        setError({
          code: 'UNKNOWN_ERROR',
          message: error instanceof Error ? error.message : 'An unexpected error occurred'
        });
      }
      console.error("Analysis error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{error.code}</span>
              <span>{error.message}</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="w-full">
        <Button
          onClick={startAnalysis}
          disabled={isAnalyzing || loading || !user || !analyserConfig.selectedStepId}
          className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isAnalyzing ? (
            <span className="flex items-center gap-2">
              <Loader className="h-4 w-4 animate-spin" />
              Analyzing...
            </span>
          ) : (
            "Start Analysis"
          )}
        </Button>
      </div>

      {analysisResult && (
        <Card className="h-96">
          <CardHeader>
            <CardTitle>Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-72 rounded-md">
              <div className="p-4">
                <p>{truncate(analysisResult, 4096)}</p>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};