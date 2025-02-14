/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/webPageAnalyser/RuntimeComponent.tsx
import React, { useState } from "react";
import { PluginRuntimeProps } from "../base";
import { WebPageAnalyserConfig, WebPageAnalyserRuntimeData } from "./types";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentsStore } from "@/store/documentsStore";

export const RuntimeComponent: React.FC<PluginRuntimeProps> = ({
  config,
  // data,
  context,
  onDataChange,
  onStatusChange,
}) => {
  const analyserConfig = config as WebPageAnalyserConfig;
  // const analyserData = (data as WebPageAnalyserRuntimeData) || {};

  const { addDocument, addContainer } = useDocumentsStore();
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  // Lista kroków (wcześniejsze wykonane taski) pobieramy z context
  const previousSteps = context.previousSteps || [];

  const handleSelectDomain = (stepId: string) => {
    setSelectedDomain(stepId);
  };

  const startAnalysis = async () => {
    if (!selectedDomain) {
      setError("Wybierz domenę z listy kroków");
      return;
    }
    setError(null);
    setIsAnalyzing(true);
    try {
      // Znajdź wybrany krok – przyjmujemy, że ma on właściwość id i opcjonalnie data.domain
      const selectedStep = previousSteps.find(
        (step: any) => step.id === selectedDomain
      );
      const url = selectedStep?.data?.domain || selectedDomain;

      // Endpoint zależny od wybranej opcji
      const endpoint = `/analyze-website/${analyserConfig.analysisType}?url=${encodeURIComponent(
        url
      )}`;

      const response = await fetch(endpoint, { method: "GET" });
      if (!response.ok) {
        throw new Error("Błąd analizy strony");
      }
      const result = await response.json();
      const content = result.content; // Zakładamy, że API zwraca { content: string }

      setAnalysisResult(content);

      // Zapis dokumentu – podobnie jak w GenerateDocPlugin
      const containerId = Date.now().toString();
      if (analyserConfig.containerName) {
        addContainer({
          name: analyserConfig.containerName,
          description: `Container for ${analyserConfig.documentName}`,
        });
      }
      const newDocument = {
        title: analyserConfig.documentName,
        content,
        documentContainerId: containerId,
        order: 0,
        metadata: {
          generatedFrom: "WebPageAnalyser",
          timestamp: new Date().toISOString(),
        },
      };
      addDocument(newDocument);

      const newData: WebPageAnalyserRuntimeData = {
        selectedDomain: url,
        analysisResult: content,
        messages: [
          {
            role: "system",
            content: `Analysis started: ${analyserConfig.analysisType} for ${url}`,
          },
          {
            role: "assistant",
            content,
          },
        ],
      };
      onDataChange(newData);
      onStatusChange(true);
    } catch (err: any) {
      setError(err.message || "Nie udało się przeprowadzić analizy");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <CardTitle>Wybierz domenę (krok)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {previousSteps.length === 0 && <p>Brak wcześniejszych kroków</p>}
            {previousSteps.map((step: any) => (
              <div key={step.id} className="flex items-center space-x-2">
                <Checkbox
                  checked={selectedDomain === step.id}
                  onCheckedChange={() => handleSelectDomain(step.id)}
                />
                <Label>{step.data?.domain || `Krok ${step.id}`}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-end">
        <Button
          onClick={startAnalysis}
          disabled={isAnalyzing}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isAnalyzing ? "Analizowanie..." : "Start Analysis"}
        </Button>
      </div>
      {analysisResult && (
        <Card>
          <CardHeader>
            <CardTitle>Wynik analizy</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{analysisResult}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
