/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/StepViewer.tsx
import { Step, ConversationItem } from "@/types";
import { getPlugin } from "./registry";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useEffect, useRef } from "react";

interface StepViewerProps {
  step: Step;
  onComplete: (result?: Record<string, any>) => void;
}

export function StepViewer({ step, onComplete }: StepViewerProps) {
  // Ref do śledzenia czy komponent jest zamontowany
  const isMounted = useRef(true);
  
  // Efekt dla ustawienia i resetowania flagi montowania
  useEffect(() => {
    // Oznaczamy komponent jako zamontowany przy inicjalizacji
    isMounted.current = true;
    
    // Funkcja czyszcząca wykonywana przy odmontowaniu
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  const plugin = getPlugin(step.type);

  if (!plugin) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Plugin not found: {step.type}</AlertDescription>
      </Alert>
    );
  }

  // Wrapper dla onComplete, który:
  // 1. Sprawdza czy komponent jest nadal zamontowany
  // 2. Prawidłowo obsługuje dane konwersacji
  // 3. Gwarantuje że przejście do następnego kroku nastąpi tylko jeśli komponent jest zamontowany
  const handleComplete = (result?: Record<string, any>, conversationData?: ConversationItem[]) => {
    // Sprawdzamy czy komponent jest nadal zamontowany
    if (!isMounted.current) return;
    
    // Dodajemy conversationData do rezultatu jeśli istnieje
    const finalResult = conversationData && conversationData.length > 0
      ? { ...result, conversationData }
      : result;
    
    // Wywołujemy callback z komponentu nadrzędnego (StepWizard)
    onComplete(finalResult);
  };

  return <plugin.Viewer step={step} onComplete={handleComplete} />;
}