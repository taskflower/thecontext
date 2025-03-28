// src/components/frontApp/WorkspaceContext.tsx
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Database, FileText, FileJson, Copy, X, ArrowLeft } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

// Import the correct type definitions
import { Workspace } from "@/modules/workspaces/types";
import { ContextItem } from "@/modules/context/types";
import { detectContentType } from "@/modules/context/utils";

interface WorkspaceContextProps {
  workspace: Workspace | null;
}

// Custom Context Viewer Dialog Component
const ContextViewerDialog: React.FC<{
  item: ContextItem;
  onClose: () => void;
  onReturnToList: () => void;
}> = ({ item, onClose, onReturnToList }) => {
  const [copySuccess, setCopySuccess] = useState(false);
  const { type } = detectContentType(item.content);
  const isJson = type === "json";

  const handleCopyContent = () => {
    navigator.clipboard.writeText(item.content);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 md:p-8"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border rounded-lg shadow-xl w-full max-w-3xl p-6 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b">
          <h3 className="text-xl font-semibold tracking-tight">Context: {item.title}</h3>
          <button
            onClick={onClose}
            className="rounded-full h-8 w-8 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 py-4 flex-grow overflow-auto">
          <div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center">
                {isJson ? (
                  <FileJson className="h-5 w-5 text-blue-500 mr-2" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-500 mr-2" />
                )}
                <label htmlFor="content" className="block text-sm font-medium">
                  {isJson ? (
                    <span>JSON Content <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded ml-1">JSON</span></span>
                  ) : (
                    "Content"
                  )}
                </label>
              </div>
              <button 
                onClick={handleCopyContent}
                className="text-xs py-1 px-2 rounded bg-muted hover:bg-muted/80 text-foreground flex items-center transition-colors"
              >
                <Copy className="h-3 w-3 mr-1" />
                {copySuccess ? "Copied!" : "Copy"}
              </button>
            </div>
            <div className={`relative border border-border rounded-md bg-muted/30 ${isJson ? 'p-0' : 'p-3'}`}>
              {isJson ? (
                <pre className="font-mono text-sm p-4 overflow-auto max-h-[60vh]">
                  {item.content}
                </pre>
              ) : (
                <div className="overflow-auto max-h-[60vh]">
                  <textarea
                    id="content"
                    name="content"
                    value={item.content}
                    rows={15}
                    className="w-full bg-transparent border-0 focus:outline-none focus:ring-0 resize-none p-0"
                    readOnly
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={onReturnToList}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Context List
          </Button>
          
          <Button
            onClick={onClose}
            variant="default"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

const WorkspaceContext: React.FC<WorkspaceContextProps> = ({ workspace }) => {
  // State for the currently selected context item to view
  const [viewingItem, setViewingItem] = useState<ContextItem | null>(null);
  
  // State to control sheet open/close
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Reference to the sheet trigger button
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  
  // Function to handle clicking on a context item
  const handleViewItem = (item: ContextItem) => {
    // First close the sheet
    setIsSheetOpen(false);
    
    // Then set the item to view (which will open the dialog)
    setTimeout(() => {
      setViewingItem(item);
    }, 33); // Minimal delay to ensure the sheet closes first
  };

  // Handle returning to context list from dialog
  const handleReturnToList = () => {
    setViewingItem(null); // Close the dialog
    
    // Then reopen the sheet after a minimal delay
    setTimeout(() => {
      setIsSheetOpen(true);
      if (sheetTriggerRef.current) {
        sheetTriggerRef.current.click();
      }
    }, 33);
  };

  return (
    <>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button
            ref={sheetTriggerRef}
            variant="outline"
            className="gap-2 shadow-sm w-full sm:w-auto"
            title="Open Workspace Context"
          >
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Context</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-xl">Context Items</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {workspace && workspace.contextItems && workspace.contextItems.length > 0 ? (
              <div className="space-y-1">
                <div className="grid grid-cols-1 gap-2">
                  {workspace.contextItems.map((item: ContextItem) => {
                    const { type } = detectContentType(item.content);
                    return (
                      <div 
                        key={item.id} 
                        className="flex items-center p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                        onClick={() => handleViewItem(item)}
                      >
                        {type === "json" ? (
                          <FileJson className="h-5 w-5 text-blue-500 mr-3 flex-shrink-0" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {item.content ? (
                              type === "json" ? "JSON content" : item.content.substring(0, 30) + (item.content.length > 30 ? "..." : "")
                            ) : (
                              <span className="italic">Empty content</span>
                            )}
                          </p>
                        </div>
                        {type === "json" && (
                          <span className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 px-1.5 py-0.5 rounded ml-2">
                            JSON
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Database className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {workspace ? "No context items found for this workspace" : "No workspace selected"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Context items provide reusable data across scenarios
                </p>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Custom Context Viewer Dialog */}
      {viewingItem && (
        <ContextViewerDialog
          item={viewingItem}
          onClose={() => setViewingItem(null)}
          onReturnToList={handleReturnToList}
        />
      )}
    </>
  );
};

export default WorkspaceContext;