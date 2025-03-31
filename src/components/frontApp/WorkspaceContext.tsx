// src/components/frontApp/WorkspaceContext.tsx
import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Database, FileText, FileJson,  Search } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import { useAppStore } from "@/modules/store";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

// Import the correct type definitions
import { ContextItem } from "@/modules/context/types";
import { detectContentType } from "@/modules/context/utils";
import { ContextViewerDialog } from "./ContextViewerDialog";



const WorkspaceContext: React.FC = () => {
  // State for the currently selected context item to view
  const [viewingItem, setViewingItem] = useState<ContextItem | null>(null);
  
  // State to control sheet open/close
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // State for search filter
  const [searchQuery, setSearchQuery] = useState("");
  
  // Reference to the sheet trigger button
  const sheetTriggerRef = useRef<HTMLButtonElement>(null);
  
  // Get current workspace from store
  const workspace = useAppStore(state => state.getCurrentWorkspace());
  
  // Get context items count safely
  const contextItemsCount = workspace?.contextItems?.length || 0;
  
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

  // Filter context items by search query
  const filteredContextItems = workspace?.contextItems?.filter(item => 
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.content.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

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
            {contextItemsCount > 0 && (
              <Badge 
                variant="secondary" 
                className="ml-1 h-5 px-1 text-xs font-normal"
              >
                {contextItemsCount}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-xl">Context Items</SheetTitle>
          </SheetHeader>
          
          <div className="relative mt-4">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search context items..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <ScrollArea className="mt-6 h-[calc(100vh-12rem)]">
            {filteredContextItems.length > 0 ? (
              <div className="space-y-2">
                {filteredContextItems.map((item: ContextItem) => {
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
            ) : (
              <div className="text-center p-6 bg-muted/50 rounded-lg">
                <Database className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  {workspace ? 
                    searchQuery ? 
                      "No matching context items found" : 
                      "No context items found for this workspace" 
                    : "No workspace selected"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Context items provide reusable data across scenarios
                </p>
              </div>
            )}
          </ScrollArea>
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