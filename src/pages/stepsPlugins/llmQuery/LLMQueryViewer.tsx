/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/stepsPlugins/llmQuery/LLMQueryViewer.tsx
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";
import { ViewerProps } from "../types";
import {
  registerPluginHandler,
  unregisterPluginHandler,
} from "../pluginHandlers";
import LLMService, { ReferenceData } from "./service/LLMService";
import { useAuthState } from "@/hooks/useAuthState";

export function LLMQueryViewer({ step, onComplete }: ViewerProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [referenceData, setReferenceData] = useState<ReferenceData | null>(null);
  const { user, loading: authLoading } = useAuthState();
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setLoading(false);
    return () => {
      isMounted.current = false;
    };
  }, [step.id]);

  // Get authentication token
  const getAuthToken = useCallback(async () => {
    try {
      if (!user) return null;
      return await user.getIdToken();
    } catch (err) {
      console.error("Error getting auth token:", err);
      return null;
    }
  }, [user]);

  // Fetch reference data if a reference step is selected
  useEffect(() => {
    const { referenceStepId } = step.config || {};
    if (referenceStepId) {
      const data = LLMService.getReferenceData(referenceStepId);
      setReferenceData(data);
    } else {
      setReferenceData(null);
    }
  }, [step.config?.referenceStepId]);

  // Register plugin handler
  useEffect(() => {
    const completeHandler = async () => {
      await handleQuery();
    };

    registerPluginHandler(step.id, completeHandler);

    return () => {
      unregisterPluginHandler(step.id);
    };
  }, [step.id]);

  const handleQuery = async () => {
    if (loading) return;

    setError(null);
    setLoading(true);
    console.log("Rozpoczęcie zapytania LLM");

    try {
      // Verify reference data is available
      if (!referenceData) {
        throw new Error("Brak referencji do poprzedniego kroku");
      }

      // Get the authentication token
      const token = await getAuthToken();

      // Process query using the service
      const { result: llmResponse, fullResult, newConversationItems } = 
        await LLMService.processQuery(step, token, referenceData);

      if (isMounted.current) {
        setResult(llmResponse);
        // Complete the step with the processed result
        onComplete(fullResult, newConversationItems);
      }
    } catch (err) {
      if (isMounted.current) {
        setError(`Błąd: ${(err as Error).message}`);
      }
      throw err; // Propagate error so handler knows about failure
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  };

  // Handle button click
  const handleButtonClick = () => {
    handleQuery().catch((err) => console.error("Błąd handleQuery:", err));
  };

  // Check if step already has a result (previously completed)
  const hasExistingResult = step.result !== null && step.result !== undefined;

  // Check if reference step exists
  const hasReference = Boolean(step.config?.referenceStepId);
  const isReferenceValid = Boolean(referenceData);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {step.title || "LLM Query"}
        </CardTitle>
        {step.description && (
          <CardDescription className="text-sm mt-1">
            {step.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reference status */}
        {hasReference ? (
          <Alert className={isReferenceValid ? "bg-blue-50" : "bg-red-50"}>
            <div className="text-sm">
              <span className="font-medium">Status referencji: </span>
              {isReferenceValid 
                ? `Połączono z krokiem: ${referenceData?.title}` 
                : "Brak połączenia z krokiem referencyjnym"}
            </div>
          </Alert>
        ) : (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Brak referencji do poprzedniego kroku. Edytuj krok, aby ustawić referencję.
            </AlertDescription>
          </Alert>
        )}

        {/* Auth status information */}
        <Alert className="bg-blue-50">
          <div className="text-sm">
            <span className="font-medium">Status uwierzytelnienia: </span>
            {authLoading ? (
              "Ładowanie..."
            ) : user ? (
              `Zalogowano jako ${user.email || user.uid}`
            ) : (
              "Niezalogowany (używanie trybu anonimowego)"
            )}
          </div>
        </Alert>

        {/* Result display */}
        {(result || hasExistingResult) && (
          <div>
            <div className="font-medium text-sm mb-1">Wynik:</div>
            <pre className="text-xs p-3 border rounded bg-muted/50 max-h-[300px] overflow-auto">
              {JSON.stringify(result || step.result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleButtonClick} 
          disabled={loading || !hasReference || !isReferenceValid}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" /> Przetwarzanie...
            </>
          ) : (
            "Wyślij zapytanie"
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}