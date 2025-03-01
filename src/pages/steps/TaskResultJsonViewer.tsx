// src/pages/steps/TaskResultJsonViewer.tsx
import { useState } from "react";
import { Code, X } from "lucide-react";
import { Step } from "@/types";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";

interface TaskResultJsonViewerProps {
  steps: Step[];
}

export function TaskResultJsonViewer({ steps }: TaskResultJsonViewerProps) {
  const [open, setOpen] = useState(false);

  // Filtruj tylko kroki, które mają wyniki
  const stepsWithResults = steps.filter(step => step.result !== null);

  return (
    <>
      {/* Dyskretna ikonka kodu */}
      <Button 
        variant="ghost"
        size="icon"
        className="h-7 w-7 opacity-70 hover:opacity-100"
        title="Pokaż surowe dane JSON"
        onClick={() => setOpen(true)}
      >
        <Code className="h-4 w-4" />
      </Button>

      {/* Dialog z danymi JSON */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh]">
          <DialogHeader className="flex flex-row items-center justify-between">
            <DialogTitle>Wyniki kroków (dane JSON)</DialogTitle>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <X className="h-4 w-4" />
              </Button>
            </DialogClose>
          </DialogHeader>
          
          <div className="overflow-auto max-h-[calc(80vh-7rem)]">
            {stepsWithResults.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Brak wyników dla kroków w tym zadaniu.
              </div>
            ) : (
              <div className="space-y-4">
                {stepsWithResults.map((step) => (
                  <div key={step.id} className="border rounded-md">
                    <div className="bg-muted p-3 border-b flex justify-between items-center">
                      <div className="font-medium">{step.title}</div>
                      <div className="text-xs text-muted-foreground">{step.type}</div>
                    </div>
                    <pre className="p-3 overflow-auto bg-black text-white rounded-b-md text-xs max-h-80">
                      {JSON.stringify(step.result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default TaskResultJsonViewer;