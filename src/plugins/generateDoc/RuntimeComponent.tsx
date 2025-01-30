/* eslint-disable @typescript-eslint/no-explicit-any */
import { PluginRuntimeProps } from "../base";
import { GenerateDocConfig, GenerateDocRuntimeData } from "./types";
import { useEffect, useState } from "react";

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
  
  const { addDocument, addContainer } = useDocumentsStore();

  const allMessages = context.previousSteps.flatMap((step: any) => step.messages || []);

  // Efekt do aktualizacji statusu
  useEffect(() => {
    onStatusChange(generateDocData?.isGenerated || false);
  }, [generateDocData?.isGenerated, onStatusChange]);

  const generateLoremIpsum = () => {
    return `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`;
  };

  const handleGenerateDocument = async () => {
    setIsGenerating(true);
    setShowSuccess(false);
    
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const containerId = Date.now().toString();
      if (generateDocConfig.containerName) {
        const newContainer = {
          name: generateDocConfig.containerName,
          description: `Container for ${generateDocConfig.documentName}`,
        };
        addContainer(newContainer);
      }

      const generatedContent = generateLoremIpsum();

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

      // Aktualizacja danych runtime
      const newData: GenerateDocRuntimeData = {
        messages: [
          ...(generateDocData?.messages || []),
          {
            role: 'assistant',
            content: generatedContent
          }
        ],
        isGenerated: true,
        generatedContent
      };
      onDataChange(newData);

    } finally {
      setIsGenerating(false);
    }
  };

    return (
    <div className="space-y-6">
      {showSuccess && (
        <Alert className="bg-green-50 border-green-200 relative">
          <AlertDescription className="text-green-800">
            Document generated successfully!
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

      <div className="flex justify-between items-center">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Document Generation Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">Document Name</p>
                <p className="text-sm">{generateDocConfig.documentName}</p>
              </div>
              <Separator />
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-medium text-muted-foreground">Container Name</p>
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
          disabled={isGenerating}
        >
          <FileText className="mr-2 h-4 w-4" />
          {isGenerating ? "Generating..." : "Generate Document"}
        </Button>
      </div>

      <Card className="w-full">
        <CardHeader className="cursor-pointer" onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}>
          <div className="flex justify-between items-center">
            <CardTitle>Conversation History</CardTitle>
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
