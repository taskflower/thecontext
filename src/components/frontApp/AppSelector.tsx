// src/components/frontApp/AppSelector.tsx
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Tabs, TabsList, TabsTrigger } from "../ui/tabs";
import { AppWindow, ChevronDown, BookOpen, MessageSquare, Database, ExternalLink, LayoutDashboard } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
// Language learning should be implemented via plugins in GUI
import { useAppStore } from "../../modules/store";
import { IndexedDBService } from "../../modules/indexedDB/service";

interface AppDefinition {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  workspaceId?: string;
  slug?: string;
  setupFunction?: () => Promise<void>;
  externalUrl?: string;
}

const AppSelector: React.FC = () => {
  const navigate = useNavigate();
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState<AppDefinition | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Store actions
  const selectWorkspace = useAppStore((state) => state.selectWorkspace);
  const currentWorkspaceId = useAppStore((state) => state.selected.workspace);
  const workspaces = useAppStore((state) => state.items);
  
  // Define available applications
  const availableApps: AppDefinition[] = [
    {
      id: "app-dashboard",
      name: "Dashboard",
      description: "Panel kontrolny aplikacji z widgetami",
      icon: <LayoutDashboard className="h-5 w-5 mr-2 text-orange-500" />,
      setupFunction: async () => {
        // Navigate to home which is now Dashboard
        navigate('/');
      }
    },
    {
      id: "language-learning",
      name: "Nauka Języków",
      description: "Aplikacja do nauki języków podobna do Duolingo",
      icon: <BookOpen className="h-5 w-5 mr-2 text-green-500" />,
      workspaceId: "language-learning-workspace",
      slug: "language-learning",
      setupFunction: async () => {
        // Language learning should be implemented via plugins in GUI
        console.log("Language learning should be implemented through GUI plugins");
      }
    },
    {
      id: "marketing-assistant",
      name: "Asystent Marketingu",
      description: "Kreator kampanii marketingowych",
      icon: <MessageSquare className="h-5 w-5 mr-2 text-blue-500" />,
      workspaceId: "workspace-duolingo", // Tymczasowo używamy istniejącego workspace
      slug: "lekcje-duolingo"
    },
    {
      id: "database-viewer",
      name: "Przeglądarka Bazy Danych",
      description: "Narzędzie do przeglądania danych w IndexedDB",
      icon: <Database className="h-5 w-5 mr-2 text-purple-500" />,
      setupFunction: async () => {
        // Otwórz widok bazy danych
        const collections = await IndexedDBService.getCollections();
        console.log("Dostępne kolekcje IndexedDB:", collections);
        
        // Tutaj możesz wyświetlić dialog z listą kolekcji
        alert(`Dostępne kolekcje: ${collections.join(", ")}`);
      }
    }
  ];
  
  // Find existing workspace for the selected app
  const findExistingWorkspace = (app: AppDefinition) => {
    if (!app.workspaceId) return null;
    
    // Sprawdź, czy workspace istnieje
    return workspaces.find(w => 
      w.id === app.workspaceId || 
      w.slug === app.slug
    );
  };
  
  // Handle app selection
  const handleAppSelect = (app: AppDefinition) => {
    setSelectedApp(app);
    
    // If external URL, open directly
    if (app.externalUrl) {
      window.open(app.externalUrl, "_blank");
      return;
    }
    
    // If this app has a setup function or doesn't match current workspace, show confirmation
    const existingWorkspace = findExistingWorkspace(app);
    
    if (app.setupFunction || !existingWorkspace) {
      setIsConfirmDialogOpen(true);
    } else {
      // App is ready to use, just navigate to it
      navigateToApp(app, existingWorkspace);
    }
  };
  
  // Navigate to selected app
  const navigateToApp = (app: AppDefinition, workspace: any) => {
    if (workspace) {
      // Select workspace and navigate to its URL
      selectWorkspace(workspace.id);
      
      if (workspace.slug) {
        navigate(`/${workspace.slug}`);
      }
    }
  };
  
  // Handle confirmation dialog confirm
  const handleConfirm = async () => {
    if (!selectedApp) return;
    
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Run setup function if provided
      if (selectedApp.setupFunction) {
        await selectedApp.setupFunction();
      }
      
      // Find workspace after setup (it might have been created)
      const existingWorkspace = findExistingWorkspace(selectedApp);
      
      if (existingWorkspace) {
        navigateToApp(selectedApp, existingWorkspace);
        setIsConfirmDialogOpen(false);
      } else {
        setErrorMessage("Nie znaleziono obszaru roboczego dla tej aplikacji.");
      }
    } catch (error) {
      console.error("Błąd podczas inicjalizacji aplikacji:", error);
      setErrorMessage(`Wystąpił błąd: ${error instanceof Error ? error.message : "Nieznany błąd"}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Check if we're on dashboard page
  const location = useLocation();
  const isOnDashboard = location.pathname.includes('/dashboard');
  
  // Tab switch handler
  const handleTabChange = (value: string) => {
    if (value === 'dashboard') {
      navigate('/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <div className="flex gap-4 items-center">
      <Tabs 
        value={isOnDashboard ? 'dashboard' : 'flow'} 
        onValueChange={handleTabChange}
        className="w-[220px]"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="flow">Flow Editor</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <AppWindow className="h-4 w-4" />
            <span>Aplikacje</span>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[240px]">
          {availableApps.map((app) => (
            <DropdownMenuItem
              key={app.id}
              onClick={() => handleAppSelect(app)}
              className="cursor-pointer py-2"
            >
              {app.icon}
              <div className="flex flex-col">
                <span>{app.name}</span>
                <span className="text-xs text-muted-foreground">{app.description}</span>
              </div>
              {app.externalUrl && <ExternalLink className="h-3 w-3 ml-2 opacity-70" />}
            </DropdownMenuItem>
          ))}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => navigate("/imports/INSTRUKCJA.md")}
            className="cursor-pointer"
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Instrukcja importu
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      {/* Confirmation Dialog */}
      <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Uruchom {selectedApp?.name}</DialogTitle>
            <DialogDescription>
              {selectedApp?.description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p>Ta aplikacja wymaga inicjalizacji danych przed pierwszym uruchomieniem. Kontynuować?</p>
            
            {errorMessage && (
              <div className="mt-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
                {errorMessage}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsConfirmDialogOpen(false)}
              disabled={isLoading}
            >
              Anuluj
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={isLoading}
            >
              {isLoading ? "Inicjalizacja..." : "Kontynuuj"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AppSelector;