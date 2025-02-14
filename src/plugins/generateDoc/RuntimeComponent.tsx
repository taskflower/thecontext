/* eslint-disable @typescript-eslint/no-explicit-any */
// src/plugins/generateDoc/RuntimeComponent.tsx
import { PluginRuntimeProps } from "../base";
import { GenerateDocConfig, GenerateDocRuntimeData } from "./types";
import { useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ScrollArea,
  ScrollBar
} from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp, FileText, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useDocumentsStore } from "@/store/documentsStore";

interface ApiError {
  code: string;
  message: string;
}

export const RuntimeComponent: React.FC<PluginRuntimeProps> = ({
  config,
  data,
  context,
  onDataChange,
  onStatusChange,
}) => {
  const generateDocConfig = config as GenerateDocConfig;
  const generateDocData = data as GenerateDocRuntimeData;
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  
  const { addDocument, addContainer } = useDocumentsStore();
  const { user, loading } = useAuthState();

  const allMessages = context.previousSteps.flatMap((step: any) => step.messages || []);

  useEffect(() => {
    onStatusChange(generateDocData?.isGenerated || false);
  }, [generateDocData?.isGenerated, onStatusChange]);

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setShowSuccess(false);
    setError(null);
    
    try {
      if (!user) {
        setError({
          code: 'AUTH_REQUIRED',
          message: 'Musisz być zalogowany aby generować dokumenty'
        });
        return;
      }

      const idToken = await user.getIdToken();
      
      const messages = allMessages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch('http://localhost:3000/api/v1/services/chat/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error) {
          setError({
            code: errorData.error.code,
            message: errorData.error.message
          });
          return;
        }
        throw new Error('Nie udało się wygenerować dokumentu');
      }

      const result = await response.json();

      if (!result.success || !result.data || !result.data.message || !result.data.message.content) {
        throw new Error('Nieprawidłowy format odpowiedzi z API');
      }

      const generatedContent = result.data.message.content;
      // Generujemy unikalne ID dla kontenera, bo API go już nie zwraca
      const containerId = Date.now().toString();
      
      if (generateDocConfig.containerName) {
        const newContainer = {
          name: generateDocConfig.containerName,
          description: `Kontener dla ${generateDocConfig.documentName}`,
        };
        addContainer(newContainer);
      }

      const newDocument = {
        title: generateDocConfig.documentName,
        content: generatedContent,
        documentContainerId: containerId,
        order: 0,
        metadata: {
          generatedFrom: 'plugin',
          timestamp: new Date().toISOString(),
        }
      };

      addDocument(newDocument);
      setShowSuccess(true);

      const newData: GenerateDocRuntimeData = {
        messages: [
          ...(generateDocData?.messages || []),
          result.data.message
        ],
        isGenerated: true,
        generatedContent
      };
      
      onDataChange(newData);
      
    } catch (error) {
      console.error('Błąd podczas generowania dokumentu:', error);
      setError({
        code: 'GENERATION_ERROR',
        message: error instanceof Error ? error.message : 'Wystąpił nieoczekiwany błąd podczas generowania dokumentu'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 relative">
          <AlertDescription className="text-green-800">
            Dokument został wygenerowany pomyślnie!
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={() => setShowSuccess(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}
      
      {error && (
        <Alert variant="destructive" className="relative">
          <AlertDescription>
            <div className="flex flex-col gap-1">
              <span className="font-semibold">{error.code}</span>
              <span>{error.message}</span>
            </div>
          </AlertDescription>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-2 h-6 w-6 p-0"
            onClick={() => setError(null)}
          >
            <X className="h-4 w-4" />
          </Button>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Szczegóły generowania dokumentu</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">Nazwa dokumentu</p>
                <p className="text-sm">{generateDocConfig.documentName}</p>
              </div>
              <Separator />
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">Nazwa kontenera</p>
                <p className="text-sm">{generateDocConfig.containerName}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleGenerateDocument}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          disabled={isGenerating || loading || !user}
        >
          <FileText className="mr-2 h-4 w-4" />
          {isGenerating ? "Generowanie..." : "Generuj dokument"}
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="cursor-pointer" onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}>
          <div className="flex justify-between items-center">
            <CardTitle>Historia konwersacji</CardTitle>
            <Button variant="ghost" size="sm">
              {isHistoryExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </CardHeader>
        {isHistoryExpanded && (
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md">
              <div className="space-y-4 pr-4">
                {allMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-lg p-4 ${
                      message.role === 'assistant' 
                        ? 'bg-muted/50'
                        : 'bg-background border'
                    }`}
                  >
                    <div className="flex flex-col space-y-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        {message.role.charAt(0).toUpperCase() + message.role.slice(1)}
                      </span>
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <ScrollBar />
            </ScrollArea>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
