import React from 'react';
import { Globe, Plus, FileJson, Upload } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWorkspaceStore } from '../workspaceStore';


const WorkspaceManagementHeader: React.FC<{
  onCreateWorkspace: () => void;
  onExport: () => void;
  onImport: () => void;
}> = ({ onCreateWorkspace, onExport, onImport }) => {
  const { currentWorkspaceId } = useWorkspaceStore();

  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Globe className="h-5 w-5 " />
          Zarządzanie workspaces
        </CardTitle>
        <CardDescription>
          Workspaces pozwalają na organizację scenariuszy i definiowanie wspólnego kontekstu
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button 
            onClick={onCreateWorkspace}
            className="w-full"
            size="lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Utwórz nowy workspace
          </Button>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={onExport}
              className="w-full"
              disabled={!currentWorkspaceId}
              variant="outline"
              size="lg"
            >
              <FileJson className="h-4 w-4 mr-2" />
              Eksportuj
            </Button>
            
            <Button
              onClick={onImport}
              className="w-full"
              variant="outline"
              size="lg"
            >
              <Upload className="h-4 w-4 mr-2" />
              Importuj
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkspaceManagementHeader;