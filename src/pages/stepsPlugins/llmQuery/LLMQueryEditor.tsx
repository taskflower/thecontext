/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/llmQuery/LLMQueryEditor.tsx
import { Label } from "@/components/ui/label";
import { EditorProps } from "../types";
import { PreviousStepsSelect } from "@/components/plugins/PreviousStepsSelect";
import { useState, useEffect } from "react";
import { getStepData } from "@/components/plugins/PreviousStepsSelect";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function LLMQueryEditor({ step, onChange }: EditorProps) {
  const config = step.config || {};
  const [referenceData, setReferenceData] = useState<any>(null);
  const [referenceWarning, setReferenceWarning] = useState<string | null>(null);

  // Pobranie danych referencyjnych dla podglądu, gdy referencja zostanie wybrana
  useEffect(() => {
    const { referenceStepId } = config;
    if (referenceStepId) {
      // Przekazujemy false jako drugi parametr - nie wymagamy ukończonego kroku!
      const stepDataResult = getStepData(referenceStepId, false);

      if (stepDataResult.step) {
        // Mamy dane o kroku nawet jeśli nie jest ukończony
        setReferenceData({
          id: stepDataResult.step.id,
          title: stepDataResult.title,
          status: stepDataResult.step.status,
          type: stepDataResult.step.type,
          // Jeśli są dostępne dane wyniku, to je pokaż
          result: stepDataResult.data,
        });

        // Wyświetl ostrzeżenie jeśli krok nie jest ukończony
        if (stepDataResult.step.status !== "completed") {
          setReferenceWarning(
            "Referencja ustawiona, ale krok nie jest jeszcze ukończony. " +
              "Dane konwersacji będą dostępne dopiero po ukończeniu referencjonowanego kroku."
          );
        } else {
          setReferenceWarning(null);
        }
      } else {
        setReferenceData(null);
        setReferenceWarning("Nie można znaleźć referencjonowanego kroku.");
      }
    } else {
      setReferenceData(null);
      setReferenceWarning(null);
    }
  }, [config.referenceStepId]);

  const updateConfig = (key: string, value: any) => {
    onChange({
      config: {
        ...config,
        [key]: value,
      },
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="referenceStepId">
          Referencja z poprzedniego pluginu
        </Label>
        <PreviousStepsSelect
          stepId={step.id}
          taskId={step.taskId}
          value={config.referenceStepId || ""}
          onChange={(value) => updateConfig("referenceStepId", value)}
          label="Wybierz referencję"
          placeholder="Wybierz referencję"
          required={true}
          // Najważniejsze - NIE wymagamy ukończonego kroku!
          requireCompleted={false}
        />

        {referenceWarning && (
          <Alert className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {referenceWarning}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Podgląd danych referencyjnych jeśli dostępne */}
      {referenceData && (
        <div className="grid gap-2">
          <Label>Informacje o referencji</Label>
          <div className="text-xs p-2 bg-muted/50 rounded border max-h-[200px] overflow-auto">
            <div className="mb-2">
              <span className="font-semibold">Krok: </span>
              {referenceData.title}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}