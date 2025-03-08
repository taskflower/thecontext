// src/plugins/textInput/TextInputViewer.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { StepViewerProps } from "../types";
import { useStepExecution } from "../useStepExecution";

export function TextInputViewer({ step, context, onComplete, onError }: StepViewerProps) {
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Uzyskaj funkcje do obsługi wykonania kroku
  const { completeStep, errorStep } = useStepExecution({
    step, 
    context, 
    onComplete, 
    onError
  });

  const {
    placeholder = "Wprowadź tekst...",
    minLength = 0,
    maxLength = 1000,
    required = true,
    multiline = true,
    rows = 6,
    label = "",
  } = step.data || {};

  // Inicjalizacja - jeśli krok ma już wynik, ustaw wartość
  useEffect(() => {
    if (step.result?.value) {
      setValue(step.result.value);
    } else {
      setValue("");
    }
    setError(null);
    setLoading(false);
  }, [step.id, step.result?.value]);

  // Obsługa zmiany wartości
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValue(e.target.value);
    setError(null);
  };

  // Walidacja wprowadzonego tekstu
  const validateInput = (): boolean => {
    if (required && !value.trim()) {
      setError("To pole jest wymagane");
      return false;
    }
    if (minLength > 0 && value.length < minLength) {
      setError(`Tekst musi mieć co najmniej ${minLength} znaków`);
      return false;
    }
    if (maxLength > 0 && value.length > maxLength) {
      setError(`Tekst nie może przekraczać ${maxLength} znaków`);
      return false;
    }
    setError(null);
    return true;
  };

  // Obsługa zatwierdzenia
  const handleSubmit = () => {
    setError(null);
    if (!validateInput()) {
      return;
    }
    
    setLoading(true);
    
    // Zatwierdź krok z wartością jako wynikiem
    completeStep(
      { value }, // wynik
      { [`${step.id}_value`]: value } // aktualizacja kontekstu zadania
    );
  };

  const renderCharCount = () => {
    if (minLength <= 0 && maxLength <= 0) return null;
    return (
      <div className="text-xs text-muted-foreground mt-2 flex justify-between">
        {minLength > 0 && (
          <div>
            {value.length} / {minLength} min znaków
          </div>
        )}
        {maxLength > 0 && (
          <div>
            {value.length} / {maxLength} max znaków
          </div>
        )}
      </div>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-medium">{step.title || "Pole tekstowe"}</CardTitle>
        {step.description && (
          <CardDescription className="text-sm mt-1">{step.description}</CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Opcjonalnie wyświetlamy label nad polem, jeśli ustawione */}
        {label && (
          <div className="font-medium text-sm mb-1">{label}</div>
        )}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {multiline ? (
          <Textarea
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            className="min-h-[100px] w-full"
            rows={rows}
          />
        ) : (
          <Input
            placeholder={placeholder}
            value={value}
            onChange={handleChange}
            className="w-full"
          />
        )}
        {renderCharCount()}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button
          onClick={handleSubmit}
          disabled={loading || (required && !value.trim())}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Przetwarzanie...
            </>
          ) : (
            "Zatwierdź"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
