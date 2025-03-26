/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/ExportImport.tsx
import React, { useState } from "react";

import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Button,

} from "@/components/ui/button";
import { 
  Card, 

  CardHeader, 

} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, Trash2, AlertCircle, FileJson} from "lucide-react";

interface StoreItem {
  id: string;
  name: string;
  description: string;
  storageKey: string;
}

export const ExportImport: React.FC<{
  open: boolean;
  onClose: () => void;
}> = ({ open, onClose }) => {
  // Available stores for export/import
  const storeItems: StoreItem[] = [
    {
      id: "flow-builder-storage",
      name: "Flow Builder",
      description: "Workspaces, scenarios, nodes, and edges",
      storageKey: "flow-builder-storage"
    },
    {
      id: "flow-plugin-storage",
      name: "Plugins Configuration",
      description: "Plugin settings and activation status",
      storageKey: "flow-plugin-storage"
    }
  ];

  // Selected stores for export
  const [selectedStores, setSelectedStores] = useState<string[]>(["flow-builder-storage", "flow-plugin-storage"]);
  
  // State for file importing
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  
  // Clear storage confirmation
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Toggle selection of a store
  const toggleStoreSelection = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId)
        ? prev.filter(id => id !== storeId)
        : [...prev, storeId]
    );
  };

  // Export selected stores to JSON file
  const handleExport = () => {
    try {
      const exportData: Record<string, any> = {};
      
      // Get data from localStorage for each selected store
      selectedStores.forEach(storeId => {
        const storeItem = storeItems.find(item => item.id === storeId);
        if (storeItem) {
          const storageData = localStorage.getItem(storeItem.storageKey);
          if (storageData) {
            exportData[storeId] = JSON.parse(storageData);
          }
        }
      });
      
      // Create download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      // Create download link and trigger download
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(dataBlob);
      downloadLink.download = `flow-builder-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    
    const files = e.target.files;
    if (files && files.length > 0) {
      setImportFile(files[0]);
    } else {
      setImportFile(null);
    }
  };

  // Import data from selected file
  const handleImport = async () => {
    try {
      setImportError(null);
      setImportSuccess(false);
      
      if (!importFile) {
        setImportError("Please select a file to import");
        return;
      }
      
      // Read file content
      const fileContent = await importFile.text();
      const importData = JSON.parse(fileContent);
      
      // Validate import data
      if (!importData || typeof importData !== 'object') {
        setImportError("Invalid import file format");
        return;
      }
      
      // Import data to localStorage for each store
      selectedStores.forEach(storeId => {
        const storeData = importData[storeId];
        if (storeData) {
          localStorage.setItem(storeId, JSON.stringify(storeData));
        }
      });
      
      setImportSuccess(true);
      setImportFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    } catch (error) {
      console.error("Import failed:", error);
      setImportError("Failed to import: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  // Clear all localStorage data
  const handleClearStorage = () => {
    try {
      // Clear only selected stores
      selectedStores.forEach(storeId => {
        const storeItem = storeItems.find(item => item.id === storeId);
        if (storeItem) {
          localStorage.removeItem(storeItem.storageKey);
        }
      });
      
      setShowClearConfirm(false);
      
      // Force reload to reinitialize stores with default values
      window.location.reload();
    } catch (error) {
      console.error("Clear storage failed:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileJson className="h-5 w-5" />
            Data Export & Import
          </DialogTitle>
          <DialogDescription>
            Export your flow builder data to a JSON file or import from a previously exported file.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto py-2">
          <Tabs defaultValue="export" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="import">Import</TabsTrigger>
              <TabsTrigger value="clear">Clear Data</TabsTrigger>
            </TabsList>
            
            {/* EXPORT TAB */}
            <TabsContent value="export" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Select data to export:</h3>
                
                <div className="grid gap-2">
                  {storeItems.map((store) => (
                    <Card key={store.id} className={selectedStores.includes(store.id) ? "border-primary/50" : ""}>
                      <CardHeader className="py-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`store-${store.id}`}
                            checked={selectedStores.includes(store.id)}
                            onCheckedChange={() => toggleStoreSelection(store.id)}
                          />
                          <div className="grid gap-1">
                            <Label 
                              htmlFor={`store-${store.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {store.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">{store.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button 
                    onClick={handleExport}
                    disabled={selectedStores.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected Data
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* IMPORT TAB */}
            <TabsContent value="import" className="space-y-4 mt-4">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Select which data to import:</h3>
                
                <div className="grid gap-2">
                  {storeItems.map((store) => (
                    <Card key={store.id} className={selectedStores.includes(store.id) ? "border-primary/50" : ""}>
                      <CardHeader className="py-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`import-store-${store.id}`}
                            checked={selectedStores.includes(store.id)}
                            onCheckedChange={() => toggleStoreSelection(store.id)}
                          />
                          <div className="grid gap-1">
                            <Label 
                              htmlFor={`import-store-${store.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {store.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">{store.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
                
                <div className="pt-2">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-full">
                      <Label htmlFor="import-file" className="text-sm font-medium">
                        Select JSON file to import:
                      </Label>
                      <div className="mt-1 flex">
                        <input
                          id="import-file"
                          type="file"
                          accept=".json"
                          onChange={handleFileSelect}
                          className="block w-full text-sm file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0 file:font-medium
                            file:bg-primary file:text-primary-foreground
                            hover:file:bg-primary/90"
                        />
                      </div>
                    </div>
                    
                    {importError && (
                      <Alert variant="destructive" className="w-full">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{importError}</AlertDescription>
                      </Alert>
                    )}
                    
                    {importSuccess && (
                      <Alert className="w-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                        <div className="flex items-center gap-2">
                          <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                            <polyline points="22 4 12 14.01 9 11.01"></polyline>
                          </svg>
                          <div>
                            <AlertTitle>Success</AlertTitle>
                            <AlertDescription>
                              Data imported successfully. Please refresh the page to see changes.
                            </AlertDescription>
                          </div>
                        </div>
                      </Alert>
                    )}
                    
                    <Button 
                      onClick={handleImport}
                      disabled={!importFile || selectedStores.length === 0}
                      className="w-full sm:w-auto"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Import Data
                    </Button>
                    
                    {importSuccess && (
                      <Button 
                        variant="outline"
                        onClick={() => window.location.reload()}
                        className="w-full sm:w-auto"
                      >
                        Refresh Page
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* CLEAR DATA TAB */}
            <TabsContent value="clear" className="space-y-4 mt-4">
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Warning</AlertTitle>
                  <AlertDescription>
                    Clearing data will remove all selected data from local storage. This action cannot be undone.
                  </AlertDescription>
                </Alert>
                
                <h3 className="text-sm font-medium">Select data to clear:</h3>
                
                <div className="grid gap-2">
                  {storeItems.map((store) => (
                    <Card key={store.id} className={selectedStores.includes(store.id) ? "border-destructive/50" : ""}>
                      <CardHeader className="py-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`clear-store-${store.id}`}
                            checked={selectedStores.includes(store.id)}
                            onCheckedChange={() => toggleStoreSelection(store.id)}
                          />
                          <div className="grid gap-1">
                            <Label 
                              htmlFor={`clear-store-${store.id}`}
                              className="text-sm font-medium cursor-pointer"
                            >
                              {store.name}
                            </Label>
                            <p className="text-xs text-muted-foreground">{store.description}</p>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
                
                <div className="pt-2 flex justify-center">
                  <Button 
                    variant="destructive"
                    onClick={() => setShowClearConfirm(true)}
                    disabled={selectedStores.length === 0}
                    className="w-full sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Selected Data
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Confirmation Dialog for Clear Data */}
      {showClearConfirm && (
        <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center text-destructive gap-2">
                <AlertCircle className="h-5 w-5" />
                Confirm Data Deletion
              </DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4">Are you sure you want to delete the following data?</p>
              <ul className="list-disc pl-5 space-y-1">
                {selectedStores.map(storeId => {
                  const store = storeItems.find(item => item.id === storeId);
                  return store ? (
                    <li key={storeId} className="text-sm">
                      <span className="font-medium">{store.name}</span> - {store.description}
                    </li>
                  ) : null;
                })}
              </ul>
              
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This action cannot be undone. All selected data will be permanently deleted.
                </AlertDescription>
              </Alert>
            </div>
            
            <DialogFooter className="gap-2 sm:gap-0">
              <Button variant="outline" onClick={() => setShowClearConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleClearStorage}>
                Yes, Delete Data
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};