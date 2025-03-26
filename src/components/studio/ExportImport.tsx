// src/components/ExportImport.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, Trash2, AlertCircle, FileJson } from "lucide-react";
import { StorageService, storeItems } from "@/services/StorageService";
import { FileService } from "@/services/FileService";
import { ExportImportConfirmationModal } from "./ExportImportConfirmationModal";


export const ExportImport: React.FC = () => {
  const [selectedStores, setSelectedStores] = useState<string[]>(storeItems.map(item => item.id));
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Toggle selection of a store
  const toggleStoreSelection = (storeId: string) => {
    setSelectedStores(prev => 
      prev.includes(storeId) ? prev.filter(id => id !== storeId) : [...prev, storeId]
    );
  };

  // Export selected stores to JSON file
  const handleExport = () => {
    try {
      const exportData = StorageService.getDataFromStores(selectedStores);
      FileService.exportDataToFile(exportData);
    } catch (error) {
      console.error("Export failed:", error);
    }
  };

  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    setImportFile(e.target.files?.[0] || null);
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
      
      const importData = await FileService.readDataFromFile(importFile);
      StorageService.setDataToStores(importData, selectedStores);
      
      setImportSuccess(true);
      setImportFile(null);
      
      // Reset file input
      const fileInput = document.getElementById('import-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
    } catch (error) {
      setImportError("Failed to import: " + (error instanceof Error ? error.message : "Unknown error"));
    }
  };

  // Clear localStorage for selected stores
  const handleClearStorage = () => {
    StorageService.clearStores(selectedStores);
    setShowClearConfirm(false);
    window.location.reload();
  };

  // Render a list of store items with checkboxes
  const renderStoreItems = (prefix: string) => (
    <div className="grid gap-2">
      {storeItems.map((store) => (
        <Card key={store.id} className={selectedStores.includes(store.id) ? "border-primary/50" : ""}>
          <CardHeader className="py-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id={`${prefix}-${store.id}`}
                checked={selectedStores.includes(store.id)}
                onCheckedChange={() => toggleStoreSelection(store.id)}
              />
              <Label htmlFor={`${prefix}-${store.id}`} className="text-sm font-medium cursor-pointer">
                {store.name}
                <p className="text-xs text-muted-foreground">{store.description}</p>
              </Label>
            </div>
          </CardHeader>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="container mx-auto py-6 max-w-xl">
      <div className="flex items-center gap-2 mb-4">
        <FileJson className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Data Export & Import</h1>
      </div>
      
      <Tabs defaultValue="export" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="import">Import</TabsTrigger>
          <TabsTrigger value="clear">Clear Data</TabsTrigger>
        </TabsList>
        
        {/* EXPORT TAB */}
        <TabsContent value="export" className="space-y-4 mt-4">
          <h3 className="text-sm font-medium">Select data to export:</h3>
          {renderStoreItems('export')}
          <Button 
            onClick={handleExport}
            disabled={selectedStores.length === 0}
            className="w-full sm:w-auto mt-4"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Selected Data
          </Button>
        </TabsContent>
        
        {/* IMPORT TAB */}
        <TabsContent value="import" className="space-y-4 mt-4">
          <h3 className="text-sm font-medium">Select which data to import:</h3>
          {renderStoreItems('import')}
          
          <div className="w-full mt-4">
            <Label htmlFor="import-file" className="text-sm font-medium">Select JSON file:</Label>
            <input
              id="import-file"
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="block w-full text-sm file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0 file:font-medium
                file:bg-primary file:text-primary-foreground"
            />
          </div>
          
          {importError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{importError}</AlertDescription>
            </Alert>
          )}
          
          {importSuccess && (
            <Alert className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>
                Data imported successfully. Please refresh the page to see changes.
              </AlertDescription>
            </Alert>
          )}
          
          <div className="flex gap-2 mt-4">
            <Button 
              onClick={handleImport}
              disabled={!importFile || selectedStores.length === 0}
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </Button>
            
            {importSuccess && (
              <Button variant="outline" onClick={() => window.location.reload()}>
                Refresh Page
              </Button>
            )}
          </div>
        </TabsContent>
        
        {/* CLEAR DATA TAB */}
        <TabsContent value="clear" className="space-y-4 mt-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              Clearing data will remove all selected data from local storage. This action cannot be undone.
            </AlertDescription>
          </Alert>
          
          <h3 className="text-sm font-medium">Select data to clear:</h3>
          {renderStoreItems('clear')}
          
          <Button 
            variant="destructive"
            onClick={() => setShowClearConfirm(true)}
            disabled={selectedStores.length === 0}
            className="mt-4"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear Selected Data
          </Button>
        </TabsContent>
      </Tabs>
      
      {showClearConfirm && (
        <ExportImportConfirmationModal
          selectedStores={selectedStores}
          storeItems={storeItems}
          onConfirm={handleClearStorage}
          onCancel={() => setShowClearConfirm(false)}
        />
      )}
    </div>
  );
};