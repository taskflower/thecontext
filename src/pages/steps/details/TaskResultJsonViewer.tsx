// src/pages/steps/TaskResultJsonViewer.tsx
import { useState } from "react";
import { Code } from "lucide-react";
import { Step } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui";

interface TaskResultJsonViewerProps {
  steps: Step[];
}

export function TaskResultJsonViewer({ steps }: TaskResultJsonViewerProps) {
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'result' | 'conversation'>('result');

  // Filter only steps that have results
  const stepsWithResults = steps.filter((step) => step.result !== null);

  return (
    <>
      {/* Discrete code icon */}
      <Button
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-70 hover:opacity-100"
        title="Show raw JSON data"
        onClick={() => setOpen(true)}
      >
        <Code className="h-4 w-4" />
      </Button>

      {/* Dialog with JSON data */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Step Results (JSON Data)</DialogTitle>
          </DialogHeader>

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'result' | 'conversation')}>
            <TabsList className="mb-4">
              <TabsTrigger value="result">Result Data</TabsTrigger>
              <TabsTrigger value="conversation">Conversation Data</TabsTrigger>
            </TabsList>

            <TabsContent value="result" className="overflow-auto max-h-[calc(80vh-7rem)]">
              {stepsWithResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No results for steps in this task.
                </div>
              ) : (
                <div className="space-y-4">
                  {stepsWithResults.map((step) => (
                    <div key={step.id} className="border rounded-md">
                      <div className="bg-muted p-3 border-b flex justify-between items-center">
                        <div className="font-medium">{step.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {step.type}
                        </div>
                      </div>
                      <pre className="p-3 overflow-auto bg-black text-white rounded-b-md text-xs max-h-80">
                        {JSON.stringify(step.result, null, 2)}
                      </pre>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="conversation" className="overflow-auto max-h-[calc(80vh-7rem)]">
              {stepsWithResults.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No conversation data available.
                </div>
              ) : (
                <div className="space-y-4">
                  {stepsWithResults.map((step) => {
                    // Determine source of conversation data
                    const conversationData = step.conversationData || 
                                            (step.result?.conversationData ? step.result.conversationData : null);
                    
                    return (
                      <div key={step.id} className="border rounded-md">
                        <div className="bg-muted p-3 border-b flex justify-between items-center">
                          <div className="font-medium">{step.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {step.type}
                          </div>
                        </div>
                        {conversationData ? (
                          <pre className="p-3 overflow-auto bg-black text-white rounded-b-md text-xs max-h-80">
                            {JSON.stringify(conversationData, null, 2)}
                          </pre>
                        ) : (
                          <div className="p-3 text-sm text-muted-foreground">
                            No conversation data available for this step.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TaskResultJsonViewer;