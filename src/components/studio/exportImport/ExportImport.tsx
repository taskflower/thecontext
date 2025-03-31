// src/components/studio/exportImport/ExportImport.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Download, Upload, AlertCircle, RefreshCw, Database, Save, CloudUpload, CloudDownload, X } from "lucide-react";
import { FileService } from "@/services/FileService";
import { FirestoreWorkspaceService } from "@/services/FirestoreWorkspaceService";
import { useAppStore } from "@/modules/store";
import { useAuth } from "@/context/AuthContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Workspace } from "@/modules/workspaces/types";

// Instancja serwisu Firestore dla workspace'ów
const firestoreWorkspaceService = new FirestoreWorkspaceService();

// Enhanced Confirmation Modal Component
interface ConfirmationModalProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  title,
  message,
  onConfirm,
  onCancel
}) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-background rounded-lg shadow-lg max-w-md w-full p-6">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center text-primary gap-2">
          <AlertCircle className="h-5 w-5" />
          <h3 className="text-lg font-bold">{title}</h3>
        </div>

        <div className="py-2">
          <p className="mb-2">{message}</p>

          <Alert variant="warning" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This action will modify your workspaces and scenarios. Make sure you have a backup before proceeding.
            </AlertDescription>
          </Alert>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </div>
  </div>
);

// Main ExportImport Component
export const ExportImport: React.FC = () => {
  // Import states
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState<boolean>(false);
  const [importType, setImportType] = useState<"new-workspace" | "existing-workspace">("new-workspace");
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");
  
  // Export states
  const [exportType, setExportType] = useState<"all" | "current-scenario">("all");
  
  // Firebase states
  const [cloudAction, setCloudAction] = useState<"save" | "load">("save");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const [cloudSuccess, setCloudSuccess] = useState<string | null>(null);
  const [cloudWorkspaces, setCloudWorkspaces] = useState<any[]>([]);
  const [selectedCloudWorkspaceIds, setSelectedCloudWorkspaceIds] = useState<string[]>([]);
  
  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [confirmationAction, setConfirmationAction] = useState<() => void>(() => {});
  const [confirmationMessage, setConfirmationMessage] = useState<string>("");
  const [confirmationTitle, setConfirmationTitle] = useState<string>("");
  
  // Get app state
  const state = useAppStore();
  const workspaces = state.items;
  const currentWorkspaceId = state.selected.workspace;
  const currentScenarioId = state.selected.scenario;
  
  // Get auth context
  const { currentUser, isLoading: authLoading } = useAuth();
  
  // Handle file selection for import
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError(null);
    setImportSuccess(false);
    setImportFile(e.target.files?.[0] || null);
  };
  
  // Firebase/cloud action types
  const [dataMode, setDataMode] = useState<"basic" | "full">("full");
  const [fullWorkspaces, setFullWorkspaces] = useState<any[]>([]);
  const [updateMode, setUpdateMode] = useState<"add" | "update">("add");
  
  // Load workspaces from cloud storage when cloudAction changes to "load"
  useEffect(() => {
    async function loadCloudWorkspaces() {
      if (cloudAction === "load" && currentUser) {
        try {
          console.log('Loading cloud workspaces...');
          console.log('Current user:', currentUser.uid);
          console.log('Data mode:', dataMode);
          
          setIsLoading(true);
          setCloudError(null);
          setCloudSuccess(null);
          
          try {
            if (dataMode === "basic") {
              // Pobierz podstawowe workspace'y (bez scenariuszy)
              console.log('Fetching basic workspaces');
              const workspaces = await firestoreWorkspaceService.getUserWorkspaces(currentUser.uid);
              console.log('Basic workspaces loaded:', workspaces.length);
              
              if (workspaces.length === 0) {
                console.log('No workspaces found - this is normal for first-time users');
              }
              
              setCloudWorkspaces(workspaces);
              setCloudSuccess(`Successfully loaded ${workspaces.length} workspaces from cloud storage (or fallback storage).`);
            } else {
              // Pobierz pełne workspace'y (ze scenariuszami i kontekstem)
              console.log('Fetching full workspaces');
              const fullWorkspacesData = await firestoreWorkspaceService.getUserFullWorkspaces(currentUser.uid);
              console.log('Full workspaces loaded:', fullWorkspacesData.length);
              
              setFullWorkspaces(fullWorkspacesData);
              
              if (fullWorkspacesData.length === 0) {
                console.log('No full workspaces found - this is normal for first-time users');
              }
              
              // Ustaw również podstawowe workspace'y dla wyświetlenia ich w liście
              const basicInfo = fullWorkspacesData.map(w => ({
                id: w.id,
                title: w.title,
                description: w.description,
                slug: w.slug,
                updatedAt: w.updatedAt,
                createdAt: w.createdAt,
                userId: w.userId
              }));
              console.log('Setting cloud workspaces UI list:', basicInfo.length);
              setCloudWorkspaces(basicInfo);
              setCloudSuccess(`Successfully loaded ${fullWorkspacesData.length} workspaces with full content from cloud storage (or fallback storage).`);
            }
          } catch (error) {
            console.error("Error during workspace fetch operation:", error);
            if (error instanceof Error) {
              console.error('Error message:', error.message);
              console.error('Error stack:', error.stack);
            }
            
            // Show error but don't block the UI
            setCloudError("Failed to load workspaces from cloud. Using local storage as fallback. Error: " + 
              (error instanceof Error ? error.message : String(error)));
              
            // Set empty array to avoid UI issues
            setCloudWorkspaces([]);
            setFullWorkspaces([]);
          }
        } catch (error) {
          console.error("Unexpected error during load operation:", error);
          console.error('Error details:', error instanceof Error ? error.stack : String(error));
          
          setCloudError("Unexpected error loading workspaces. Please try again later.");
          
          // Set empty arrays to avoid UI issues
          setCloudWorkspaces([]);
          setFullWorkspaces([]);
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    loadCloudWorkspaces();
  }, [cloudAction, currentUser, dataMode]);
  
  // Update selected cloud workspace IDs when checkbox is clicked
  const toggleCloudWorkspaceSelection = (workspaceId: string) => {
    setSelectedCloudWorkspaceIds(prev => {
      if (prev.includes(workspaceId)) {
        return prev.filter(id => id !== workspaceId);
      } else {
        return [...prev, workspaceId];
      }
    });
  };
  
  // Save workspaces to cloud storage
  const handleSaveToFirebase = async () => {
    if (!currentUser) {
      setCloudError("You must be logged in to save workspaces");
      return;
    }
    
    if (workspaces.length === 0) {
      setCloudError("You don't have any workspaces to save");
      return;
    }
    
    let confirmMessage = "";
    if (dataMode === "basic") {
      confirmMessage = "This will save all your workspaces (without content) to cloud storage. Continue?";
    } else {
      confirmMessage = "This will save all your workspaces with their FULL content (scenarios, plugins, context, etc.) to cloud storage. Continue?";
    }
    
    setConfirmationTitle("Save to Cloud Storage");
    setConfirmationMessage(confirmMessage);
    setConfirmationAction(() => async () => {
      try {
        setIsLoading(true);
        setCloudError(null);
        setCloudSuccess(null);
        
        if (dataMode === "basic") {
          // Zapisz tylko podstawowe informacje o workspace'ach
          const savedIds = await firestoreWorkspaceService.saveWorkspaces(workspaces as Workspace[], currentUser.uid);
          setCloudSuccess(`Successfully saved ${savedIds.length} workspace(s) (basic info only)`);
        } else {
          // Zapisz pełne workspace'y z wszystkimi danymi
          
          // Przygotuj pełny stan aplikacji do zapisu
          const appStateStr = localStorage.getItem('flowchart-app-state');
          if (!appStateStr) {
            throw new Error("Could not find application state in localStorage");
          }
          
          const appState = JSON.parse(appStateStr);
          const savedIds: string[] = [];
          
          // Zapisz każdy workspace oddzielnie
          for (const workspace of workspaces) {
            // Przygotuj dane workspace'a do zapisu
            // Wyciągnij z pełnego stanu tylko dane dla tego workspace'a
            const workspaceFullData = {
              workspaceData: workspace,
              appState: {
                // Cały stan związany z tym workspace'em
                version: appState.version,
                // Przekazujemy tylko wybrane pola z pełnego stanu
                state: {
                  stateVersion: appState.state.stateVersion,
                  selected: appState.state.selected,
                  // Filtrujemy dane dla kontekstu, scenariuszy, nodów, krawędzi itp.
                  items: appState.state.items.filter((item: any) => item.id === workspace.id),
                  // Jeśli są dodatkowe pola stanu, które są potrzebne, dodaj je tutaj
                }
              }
            };
            
            // Zapisz pełne dane workspace'a
            const id = await firestoreWorkspaceService.saveFullWorkspace(
              workspace as Workspace, 
              workspaceFullData,
              currentUser.uid
            );
            savedIds.push(id);
          }
          
          setCloudSuccess(`Successfully saved ${savedIds.length} workspace(s) with FULL content`);
        }
      } catch (error) {
        console.error("Error saving workspaces:", error);
        setCloudError("Failed to save workspaces: " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsLoading(false);
      }
    });
    
    setShowConfirmation(true);
  };
  
  // Load workspaces from cloud storage
  const handleLoadFromFirebase = async () => {
    if (!currentUser) {
      setCloudError("You must be logged in to load workspaces");
      return;
    }
    
    if (selectedCloudWorkspaceIds.length === 0) {
      setCloudError("Please select at least one workspace to load");
      return;
    }
    
    let confirmMessage = "";
    if (dataMode === "basic") {
      confirmMessage = `This will load ${selectedCloudWorkspaceIds.length} workspace(s) (without content) from cloud storage. Continue?`;
    } else {
      confirmMessage = `This will load ${selectedCloudWorkspaceIds.length} workspace(s) with their FULL content (scenarios, plugins, context, etc.) from cloud storage. Continue?`;
    }
    
    setConfirmationTitle("Load from Cloud Storage");
    setConfirmationMessage(confirmMessage);
    setConfirmationAction(() => async () => {
      try {
        setIsLoading(true);
        setCloudError(null);
        setCloudSuccess(null);
        
        // Get current state from localStorage to ensure we're working with the latest data
        const currentStateStr = localStorage.getItem('flowchart-app-state');
        let currentState;
        
        try {
          currentState = currentStateStr ? JSON.parse(currentStateStr) : null;
        } catch (e) {
          console.error("Failed to parse current state:", e);
          currentState = null;
        }
        
        // Use the parsed state or fall back to the current state from the store
        const baseState = currentState?.state || {
          items: state.items,
          selected: state.selected,
          stateVersion: state.stateVersion
        };
        
        if (dataMode === "basic") {
          // Get the selected cloud workspaces
          const selectedWorkspaces = cloudWorkspaces.filter(workspace => 
            selectedCloudWorkspaceIds.includes(workspace.id)
          );
          
          // Convert to application workspaces (without scenarios or other data)
          const newWorkspaces = selectedWorkspaces.map(workspace => ({
            id: workspace.id,
            title: workspace.title,
            description: workspace.description,
            slug: workspace.slug,
            updatedAt: workspace.updatedAt,
            createdAt: workspace.createdAt,
            children: [] // Workspace without scenarios
          }));
          
          // Create a copy of the current items array
          let updatedItems = [...baseState.items];
          
          if (updateMode === "update") {
            // Update existing workspaces or add new ones
            for (const newWorkspace of newWorkspaces) {
              const existingIndex = updatedItems.findIndex((item: any) => item.id === newWorkspace.id);
              
              if (existingIndex !== -1) {
                // Update existing workspace
                updatedItems[existingIndex] = {
                  ...updatedItems[existingIndex],
                  title: newWorkspace.title,
                  description: newWorkspace.description,
                  slug: newWorkspace.slug,
                  updatedAt: newWorkspace.updatedAt
                };
              } else {
                // Add new workspace
                updatedItems.push(newWorkspace);
              }
            }
          } else {
            // Add as new workspaces with new IDs
            const timestampNow = Date.now();
            const workspacesWithNewIds = newWorkspaces.map((workspace, index) => ({
              ...workspace,
              id: `workspace-${timestampNow}-${index}-${Math.floor(Math.random() * 10000)}`
            }));
            
            updatedItems = [...updatedItems, ...workspacesWithNewIds];
          }
          
          // Update state
          const updatedState = {
            ...baseState,
            items: updatedItems,
            stateVersion: (baseState.stateVersion || 0) + 1
          };
          
          // Format in the same structure as the original
          const storageData = {
            state: updatedState,
            version: currentState?.version || 1
          };
          
          // Update local storage directly
          localStorage.setItem('flowchart-app-state', JSON.stringify(storageData));
          
          setCloudSuccess(`Successfully ${updateMode === "update" ? "updated" : "added"} ${selectedWorkspaces.length} basic workspace(s)`);
        } else {
          // Load full workspaces with all their data
          // Iterate through each selected workspace and get its full data
          const loadedWorkspaces = [];
          
          for (const workspaceId of selectedCloudWorkspaceIds) {
            const fullWorkspace = await firestoreWorkspaceService.getFullWorkspace(workspaceId, currentUser.uid);
            
            if (fullWorkspace) {
              loadedWorkspaces.push(fullWorkspace);
            }
          }
          
          if (loadedWorkspaces.length === 0) {
            throw new Error("No workspaces could be loaded");
          }
          
          // Przygotowanie tablicy nowych workspace'ów do dodania do stanu aplikacji
          const newItems = [];
          
          // Get existing workspace IDs
          const existingWorkspaceIds = baseState.items.map((item: any) => item.id);
          
          // Create a copy of the current items array
          let updatedItems = [...baseState.items];
          
          // Przetwarzanie każdego wczytanego workspace'a
          for (const fullWorkspace of loadedWorkspaces) {
            // Jeśli workspace ma pełną zawartość, użyj jej
            if (fullWorkspace.content && 
                fullWorkspace.content.workspaceData && 
                fullWorkspace.content.appState) {
              
              // Ekstraktujemy zawartość workspace'a z pełnych danych
              const workspaceData = fullWorkspace.content.workspaceData;
              
              if (updateMode === "update" && existingWorkspaceIds.includes(workspaceData.id)) {
                // Update existing workspace
                const existingIndex = updatedItems.findIndex((item: any) => item.id === workspaceData.id);
                
                if (existingIndex !== -1) {
                  // Replace with the new workspace data
                  updatedItems[existingIndex] = workspaceData;
                }
              } else if (updateMode === "add" && existingWorkspaceIds.includes(workspaceData.id)) {
                // Add as new with a new ID
                const newId = `workspace-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
                
                // Aktualizuj ID workspace'a i przygotuj do dodania
                const modifiedWorkspace = {
                  ...workspaceData,
                  id: newId
                };
                
                newItems.push(modifiedWorkspace);
              } else {
                // It's a new workspace, just add it
                newItems.push(workspaceData);
              }
            } else {
              // Fallback dla przypadku, gdy zawartość jest niedostępna
              const basicWorkspace = {
                id: fullWorkspace.id,
                title: fullWorkspace.title,
                description: fullWorkspace.description,
                slug: fullWorkspace.slug,
                updatedAt: fullWorkspace.updatedAt,
                createdAt: fullWorkspace.createdAt,
                children: [] // Pusty workspace
              };
              
              // Handle same way based on update mode
              if (updateMode === "update" && existingWorkspaceIds.includes(basicWorkspace.id)) {
                // Update existing workspace
                const existingIndex = updatedItems.findIndex((item: any) => item.id === basicWorkspace.id);
                
                if (existingIndex !== -1) {
                  // Only update basic properties, leave children intact
                  updatedItems[existingIndex] = {
                    ...updatedItems[existingIndex],
                    title: basicWorkspace.title,
                    description: basicWorkspace.description,
                    slug: basicWorkspace.slug,
                    updatedAt: basicWorkspace.updatedAt
                  };
                }
              } else if (updateMode === "add" && existingWorkspaceIds.includes(basicWorkspace.id)) {
                // Add as new with a new ID
                const newId = `workspace-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
                
                newItems.push({
                  ...basicWorkspace,
                  id: newId
                });
              } else {
                // New workspace
                newItems.push(basicWorkspace);
              }
            }
          }
          
          // If we're in update mode, we've already updated the items array
          // Otherwise, add all new items to the existing ones
          if (updateMode === "add") {
            updatedItems = [...updatedItems, ...newItems];
          }
          
          // Aktualizuj stan aplikacji z nowymi workspace'ami
          const updatedState = {
            ...baseState,
            items: updatedItems,
            stateVersion: (baseState.stateVersion || 0) + 1
          };
          
          // Format in the same structure as the original
          const storageData = {
            state: updatedState,
            version: currentState?.version || 1
          };
          
          // Update local storage directly
          localStorage.setItem('flowchart-app-state', JSON.stringify(storageData));
          
          setCloudSuccess(`Successfully ${updateMode === "update" ? "updated" : "added"} ${loadedWorkspaces.length} full workspace(s) with all their content`);
        }
        
        // Reset selection
        setSelectedCloudWorkspaceIds([]);
      } catch (error) {
        console.error("Error loading workspaces:", error);
        setCloudError("Failed to load workspaces: " + (error instanceof Error ? error.message : String(error)));
      } finally {
        setIsLoading(false);
      }
    });
    
    setShowConfirmation(true);
  };
  
  // Export function
  const handleExport = () => {
    try {
      if (exportType === "all") {
        // Export all workspaces and settings in the same format as the original
        const exportData = {
          "flowchart-app-state": {
            "state": {
              "items": state.items,
              "selected": state.selected,
              "stateVersion": state.stateVersion,
              "flowSession": {
                "isPlaying": false,
                "currentStepIndex": 0,
                "temporarySteps": []
              }
            },
            "version": 1
          }
        };
        FileService.exportDataToFile(exportData);
      } else {
        // Export only current scenario
        const currentWorkspace = state.items.find(w => w.id === currentWorkspaceId);
        if (!currentWorkspace) {
          setImportError("No workspace selected");
          return;
        }
        
        const currentScenario = currentWorkspace.children.find(s => s.id === currentScenarioId);
        if (!currentScenario) {
          setImportError("No scenario selected");
          return;
        }
        
        // Create a new workspace with only the selected scenario
        const exportWorkspace = {
          ...currentWorkspace,
          children: [currentScenario]
        };
        
        // Export in the same format as the original
        const exportData = {
          "flowchart-app-state": {
            "state": {
              "items": [exportWorkspace],
              "selected": {
                workspace: exportWorkspace.id,
                scenario: currentScenario.id,
                node: ""
              },
              "stateVersion": state.stateVersion,
              "flowSession": {
                "isPlaying": false,
                "currentStepIndex": 0,
                "temporarySteps": []
              }
            },
            "version": 1
          }
        };
        
        FileService.exportDataToFile(exportData);
      }
    } catch (error) {
      console.error("Export failed:", error);
      setImportError("Export failed: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  // Import function
  const handleImport = async () => {
    try {
      setImportError(null);
      setImportSuccess(false);
      
      if (!importFile) {
        setImportError("Please select a file to import");
        return;
      }
      
      const importData = await FileService.readDataFromFile(importFile);
      
      // Validate imported data - handle both direct format and nested format
      let itemsData;
      
      // Check if data is in nested format (flowchart-app-state.state.items)
      if (importData["flowchart-app-state"] && importData["flowchart-app-state"].state && importData["flowchart-app-state"].state.items) {
        itemsData = importData["flowchart-app-state"].state.items;
      } 
      // Check if data is in direct format (items)
      else if (importData.items) {
        itemsData = importData.items;
      }
      
      if (!itemsData || !Array.isArray(itemsData)) {
        setImportError("Invalid import file: missing or invalid 'items' property");
        return;
      }
      
      // Handle import based on selected method
      if (importType === "new-workspace") {
        // Confirm before importing as new workspace
        setConfirmationTitle("Import as New Workspace");
        setConfirmationMessage("This will add all imported workspaces to your list. Continue?");
        setConfirmationAction(() => () => {
          // Add imported workspaces with new IDs to prevent conflicts
          const currentTime = Date.now();
          
          // Get the appropriate items array based on structure
          const itemsToImport = importData["flowchart-app-state"]?.state?.items || importData.items;
          
          const newWorkspaces = itemsToImport.map((workspace: any) => ({
            ...workspace,
            id: `workspace-${currentTime}-${Math.floor(Math.random() * 10000)}`,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            children: workspace.children.map((scenario: any) => ({
              ...scenario,
              id: `scenario-${currentTime}-${Math.floor(Math.random() * 10000)}`
            }))
          }));
          
          // Get current state from localStorage to ensure we're working with the latest data
          const currentStateStr = localStorage.getItem('flowchart-app-state');
          let currentState;
          
          try {
            currentState = currentStateStr ? JSON.parse(currentStateStr) : null;
          } catch (e) {
            console.error("Failed to parse current state:", e);
            currentState = null;
          }
          
          // Use the parsed state or fall back to the current state from the store
          const baseState = currentState?.state || {
            items: state.items,
            selected: state.selected,
            stateVersion: state.stateVersion
          };
          
          // Add new workspaces to existing ones
          const updatedState = {
            ...baseState,
            items: [...baseState.items, ...newWorkspaces],
            stateVersion: (baseState.stateVersion || 0) + 1
          };
          
          // Format in the same structure as the original
          const storageData = {
            state: updatedState,
            version: currentState?.version || 1
          };
          
          // Update local storage directly
          localStorage.setItem('flowchart-app-state', JSON.stringify(storageData));
          
          setImportSuccess(true);
          setImportFile(null);
          
          // Reset file input
          const fileInput = document.getElementById("import-file") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        });
        setShowConfirmation(true);
      } else {
        // Add scenarios to existing workspace
        if (!selectedWorkspaceId) {
          setImportError("Please select a workspace to import scenarios into");
          return;
        }
        
        // Find the selected workspace
        const targetWorkspace = state.items.find(w => w.id === selectedWorkspaceId);
        if (!targetWorkspace) {
          setImportError("Selected workspace not found");
          return;
        }
        
        // Get the appropriate items array based on structure
        const itemsToImport = importData["flowchart-app-state"]?.state?.items || importData.items;
        
        // Make sure imported data has at least one workspace with scenarios
        if (itemsToImport.length === 0 || !itemsToImport[0].children) {
          setImportError("No scenarios found in import file");
          return;
        }
        
        // Get all scenarios from all workspaces in the import
        const allImportedScenarios = itemsToImport.flatMap((workspace: any) => 
          workspace.children || []);
        
        if (allImportedScenarios.length === 0) {
          setImportError("No scenarios found in import file");
          return;
        }
        
        // Confirm before adding scenarios to existing workspace
        setConfirmationTitle("Import to Existing Workspace");
        setConfirmationMessage(`This will add ${allImportedScenarios.length} scenarios to the workspace "${targetWorkspace.title}". Continue?`);
        setConfirmationAction(() => () => {
          // Generate new IDs for imported scenarios
          const currentTime = Date.now();
          const newScenarios = allImportedScenarios.map((scenario: any) => ({
            ...scenario,
            id: `scenario-${currentTime}-${Math.floor(Math.random() * 10000)}`
          }));
          
          // Get current state from localStorage to ensure we're working with the latest data
          const currentStateStr = localStorage.getItem('flowchart-app-state');
          let currentState;
          
          try {
            currentState = currentStateStr ? JSON.parse(currentStateStr) : null;
          } catch (e) {
            console.error("Failed to parse current state:", e);
            currentState = null;
          }
          
          // Use the parsed state or fall back to the current state from the store
          const baseState = currentState?.state || state;
          
          // Create a deep copy of the current items
          const updatedWorkspaces = JSON.parse(JSON.stringify(baseState.items || []));
          
          // Find the target workspace and append the new scenarios
          const targetWorkspaceIndex = updatedWorkspaces.findIndex((w: any) => w.id === selectedWorkspaceId);
          
          if (targetWorkspaceIndex !== -1) {
            // Ensure workspace has children array
            if (!updatedWorkspaces[targetWorkspaceIndex].children) {
              updatedWorkspaces[targetWorkspaceIndex].children = [];
            }
            
            // Add new scenarios to the workspace
            updatedWorkspaces[targetWorkspaceIndex].children = [
              ...updatedWorkspaces[targetWorkspaceIndex].children,
              ...newScenarios
            ];
            
            // Update timestamp
            updatedWorkspaces[targetWorkspaceIndex].updatedAt = Date.now();
          }
          
          // Update local storage with the new state
          const updatedState = {
            ...baseState,
            items: updatedWorkspaces,
            stateVersion: (baseState.stateVersion || 0) + 1
          };
          
          // Format in the same structure as the original
          const storageData = {
            state: updatedState,
            version: currentState?.version || 1
          };
          
          localStorage.setItem('flowchart-app-state', JSON.stringify(storageData));
          
          setImportSuccess(true);
          setImportFile(null);
          
          // Reset file input
          const fileInput = document.getElementById("import-file") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
        });
        setShowConfirmation(true);
      }
    } catch (error) {
      setImportError("Failed to import: " + (error instanceof Error ? error.message : String(error)));
    }
  };
  
  return (
    <div className="h-full overflow-auto">
      <div className="p-4 space-y-4">
        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="cloud">Backup & Restore</TabsTrigger>
          </TabsList>

          {/* EXPORT TAB */}
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <RadioGroup
                  value={exportType}
                  onValueChange={(value) => setExportType(value as "all" | "current-scenario")}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="all" id="export-all" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="export-all" className="font-medium">
                        Export all workspaces
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Export all workspaces with all scenarios, nodes, and edges
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="current-scenario" id="export-current" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="export-current" className="font-medium">
                        Export current scenario only
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Export only the currently selected scenario with its nodes and edges
                      </p>
                      {(exportType === "current-scenario" && (!currentWorkspaceId || !currentScenarioId)) && (
                        <Alert variant="destructive" className="mt-2">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            Please select a workspace and scenario first
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>
                </RadioGroup>
              </CardHeader>
            </Card>
            
            <Button
              onClick={handleExport}
              disabled={exportType === "current-scenario" && (!currentWorkspaceId || !currentScenarioId)}
              className="mt-4"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </TabsContent>

          {/* IMPORT TAB */}
          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader className="p-4">
                <RadioGroup
                  value={importType}
                  onValueChange={(value) => setImportType(value as "new-workspace" | "existing-workspace")}
                  className="space-y-3"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="new-workspace" id="import-new" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="import-new" className="font-medium">
                        Import as new workspace(s)
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add imported workspaces separately from existing ones
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem value="existing-workspace" id="import-existing" />
                    <div className="grid gap-1.5">
                      <Label htmlFor="import-existing" className="font-medium">
                        Import scenarios to existing workspace
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Add imported scenarios to one of your existing workspaces
                      </p>
                    </div>
                  </div>
                </RadioGroup>
                
                {importType === "existing-workspace" && (
                  <div className="mt-4">
                    <Label htmlFor="workspace-select" className="mb-2 block text-sm font-medium">
                      Select target workspace
                    </Label>
                    <Select
                      value={selectedWorkspaceId}
                      onValueChange={setSelectedWorkspaceId}
                    >
                      <SelectTrigger id="workspace-select" className="w-full">
                        <SelectValue placeholder="Select a workspace" />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces.map((workspace) => (
                          <SelectItem key={workspace.id} value={workspace.id}>
                            {workspace.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </CardHeader>
            </Card>

            <div className="mt-4">
              <Label htmlFor="import-file" className="text-sm font-medium mb-2 block">
                Select JSON file to import:
              </Label>
              <input
                id="import-file"
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="block w-full text-sm file:mr-4 file:py-1 file:px-3
                  file:rounded-md file:border-0 file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90"
              />
            </div>

            {importError && (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{importError}</AlertDescription>
              </Alert>
            )}

            {importSuccess && (
              <Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 mt-4">
                <AlertTitle>Success</AlertTitle>
                <AlertDescription>
                  Data imported successfully. Please refresh the page to see changes.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleImport}
                disabled={!importFile || (importType === "existing-workspace" && !selectedWorkspaceId)}
                className="mt-4"
              >
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>

              {importSuccess && (
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Page
                </Button>
              )}
            </div>
          </TabsContent>

          {/* BACKUP & RESTORE TAB */}
          <TabsContent value="cloud" className="space-y-4">
            {!currentUser ? (
              <Alert variant="destructive" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Authentication Required</AlertTitle>
                <AlertDescription>
                  You need to sign in to use backup and restore features.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <Card>
                  <CardHeader className="p-4">
                    <RadioGroup
                      value={cloudAction}
                      onValueChange={(value) => setCloudAction(value as "save" | "load")}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="save" id="cloud-save" />
                        <div className="grid gap-1.5">
                          <Label htmlFor="cloud-save" className="font-medium">
                            Save to Cloud Storage
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Save your workspaces to cloud storage
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start space-x-2">
                        <RadioGroupItem value="load" id="cloud-load" />
                        <div className="grid gap-1.5">
                          <Label htmlFor="cloud-load" className="font-medium">
                            Load from Cloud Storage
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Load your workspaces from cloud storage
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                    
                    <div className="mt-4 border-t pt-4">
                      <h4 className="text-sm font-medium mb-2">Data Mode</h4>
                      <RadioGroup
                        value={dataMode}
                        onValueChange={(value) => setDataMode(value as "basic" | "full")}
                        className="space-y-3"
                      >
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="basic" id="data-basic" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="data-basic" className="font-medium">
                              Basic Info Only
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Save/load only workspace metadata without content
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-start space-x-2">
                          <RadioGroupItem value="full" id="data-full" />
                          <div className="grid gap-1.5">
                            <Label htmlFor="data-full" className="font-medium">
                              Full Content
                            </Label>
                            <p className="text-sm text-muted-foreground">
                              Save/load complete workspace with all scenarios, plugins, context, etc.
                            </p>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                    
                    {cloudAction === "load" && (
                      <div className="mt-4 border-t pt-4">
                        <h4 className="text-sm font-medium mb-2">Update Mode</h4>
                        <RadioGroup
                          value={updateMode}
                          onValueChange={(value) => setUpdateMode(value as "add" | "update")}
                          className="space-y-3"
                        >
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="add" id="update-add" />
                            <div className="grid gap-1.5">
                              <Label htmlFor="update-add" className="font-medium">
                                Add New Workspaces
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Add loaded workspaces as new items (even if they exist already)
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="update" id="update-existing" />
                            <div className="grid gap-1.5">
                              <Label htmlFor="update-existing" className="font-medium">
                                Update Existing Workspaces
                              </Label>
                              <p className="text-sm text-muted-foreground">
                                Replace existing workspaces with the same ID, add any new ones
                              </p>
                            </div>
                          </div>
                        </RadioGroup>
                      </div>
                    )}
                  </CardHeader>
                </Card>

                {cloudAction === "save" ? (
                  <Card>
                    <CardHeader className="p-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Save className="h-4 w-4 mr-2" />
                        Save Workspaces to Cloud Storage
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {dataMode === "full" 
                          ? "This will save all your workspaces with their FULL content (scenarios, context, plugins, etc.) to cloud storage."
                          : "This will save all your workspaces (without content) to cloud storage."}
                        &nbsp;You can load them later or on another device.
                      </p>
                      <Alert className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100 my-2">
                        <AlertDescription>
                          <strong>Storage Notice:</strong> This app tries to use Firebase for cloud storage first. If Firebase permissions are unavailable (which is common in some browsers or environments), the system will automatically save to your browser's local storage instead. This fallback still allows you to back up and restore workspaces, but they'll only be accessible on this specific device and browser.
                        </AlertDescription>
                      </Alert>
                      {dataMode === "full" && (
                        <Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 my-2">
                          <AlertDescription>
                            <strong>Full Content Mode enabled!</strong> Saving workspaces with all scenarios, nodes, plugins and context data.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="mt-4">
                        <Button 
                          onClick={handleSaveToFirebase} 
                          disabled={isLoading || workspaces.length === 0}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>Loading...</>
                          ) : (
                            <>
                              <CloudUpload className="h-4 w-4 mr-2" />
                              Save {workspaces.length} Workspace(s) {dataMode === "full" ? "with Full Content" : "Basic Info Only"}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader className="p-4">
                      <h3 className="text-lg font-medium flex items-center">
                        <Database className="h-4 w-4 mr-2" />
                        Load Workspaces from Cloud Storage
                      </h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {dataMode === "full" 
                          ? "Select workspaces to load with their FULL content (scenarios, contexts, plugins, etc.):"
                          : "Select workspaces to load (basic info only, without content):"}
                      </p>
                      <Alert className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-100 my-2">
                        <AlertDescription>
                          <strong>Storage Notice:</strong> This app tries to use Firebase for cloud storage first. If Firebase permissions are unavailable (which is common in some browsers or environments), the system will automatically use your browser's local storage as a fallback. In fallback mode, you'll only see workspaces saved on this specific device and browser.
                        </AlertDescription>
                      </Alert>
                      {dataMode === "full" && (
                        <Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 my-2">
                          <AlertDescription>
                            <strong>Full Content Mode enabled!</strong> Loading workspaces with all scenarios, nodes, plugins and context data.
                          </AlertDescription>
                        </Alert>
                      )}
                      <div className="mt-4 max-h-60 overflow-y-auto">
                        {isLoading ? (
                          <div className="flex items-center justify-center py-4">
                            <p>Loading workspaces...</p>
                          </div>
                        ) : cloudWorkspaces.length === 0 ? (
                          <Alert className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-100">
                            <AlertTitle>No Workspaces Found</AlertTitle>
                            <AlertDescription>
                              You don't have any workspaces saved in cloud storage.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-2">
                            {cloudWorkspaces && cloudWorkspaces.length > 0 ? (
                              cloudWorkspaces.map((workspace) => (
                                <div key={workspace.id} className="flex items-center p-2 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
                                  <input
                                    type="checkbox"
                                    id={`workspace-${workspace.id}`}
                                    checked={selectedCloudWorkspaceIds.includes(workspace.id)}
                                    onChange={() => toggleCloudWorkspaceSelection(workspace.id)}
                                    className="mr-2"
                                  />
                                  <Label htmlFor={`workspace-${workspace.id}`} className="flex-1 cursor-pointer">
                                    <span className="font-medium">{workspace.title || "Untitled Workspace"}</span>
                                    <p className="text-xs text-muted-foreground">
                                      {workspace.description || "No description"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Updated: {workspace.updatedAt ? new Date(workspace.updatedAt).toLocaleString() : "N/A"}
                                    </p>
                                  </Label>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    // Confirm before deleting
                                    setConfirmationTitle("Delete Cloud Workspace");
                                    setConfirmationMessage(`Are you sure you want to delete workspace "${workspace.title}" from cloud storage? This cannot be undone.`);
                                    setConfirmationAction(() => async () => {
                                      try {
                                        setIsLoading(true);
                                        setCloudError(null);
                                        setCloudSuccess(null);
                                        
                                        // Delete the workspace from cloud storage
                                        await firestoreWorkspaceService.deleteWorkspace(workspace.id);
                                        
                                        // Remove from state
                                        setCloudWorkspaces(prev => prev.filter(w => w.id !== workspace.id));
                                        setSelectedCloudWorkspaceIds(prev => prev.filter(id => id !== workspace.id));
                                        
                                        // Clear any previous errors and show success message
                                        setCloudError(null);
                                        setCloudSuccess(`Successfully deleted workspace "${workspace.title}" from cloud storage`);
                                      } catch (error) {
                                        console.error("Error deleting workspace from cloud storage:", error);
                                        setCloudError("Failed to delete workspace: " + (error instanceof Error ? error.message : String(error)));
                                      } finally {
                                        setIsLoading(false);
                                      }
                                    });
                                    setShowConfirmation(true);
                                  }}
                                  className="ml-2 p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                                  title="Delete from cloud storage"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))
                            ) : (
                              <div className="flex items-center justify-center py-4">
                                <p className="text-sm text-muted-foreground">No workspaces found. You can save some first.</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="mt-4">
                        <Button 
                          onClick={handleLoadFromFirebase} 
                          disabled={isLoading || selectedCloudWorkspaceIds.length === 0}
                          className="w-full"
                        >
                          {isLoading ? (
                            <>Loading...</>
                          ) : (
                            <>
                              <CloudDownload className="h-4 w-4 mr-2" />
                              Load {selectedCloudWorkspaceIds.length} Selected Workspace(s) {dataMode === "full" ? "with Full Content" : "Basic Info Only"}
                            </>
                          )}
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                )}

                {cloudError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{cloudError}</AlertDescription>
                  </Alert>
                )}

                {cloudSuccess && (
                  <Alert className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-100 mt-4">
                    <AlertTitle>Success</AlertTitle>
                    <AlertDescription>
                      {cloudSuccess}
                      {cloudAction === "load" && (
                        <Button
                          variant="outline"
                          onClick={() => window.location.reload()}
                          className="mt-2 w-full"
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Refresh Page to See Changes
                        </Button>
                      )}
                    </AlertDescription>
                  </Alert>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {showConfirmation && (
        <ConfirmationModal
          title={confirmationTitle}
          message={confirmationMessage}
          onConfirm={() => {
            confirmationAction();
            setShowConfirmation(false);
          }}
          onCancel={() => setShowConfirmation(false)}
        />
      )}
    </div>
  );
};

export default ExportImport;