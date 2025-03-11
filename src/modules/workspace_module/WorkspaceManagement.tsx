/* eslint-disable @typescript-eslint/no-explicit-any */
// src/modules/workspaces_module/WorkspaceManagement.tsx
import React, { useState } from 'react';
import { useWorkspaceStore, WorkspaceType } from './workspaceStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Users, 
  Target, 
  Box, 
  Plus, 
  FileJson, 
  Upload, 
  Trash2,
  Edit,
  Layers,

} from "lucide-react";
import MCard from "@/components/MCard";
import MDialog from "@/components/MDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { exportToJsonFile, parseJsonFile } from '../shared/jsonUtils';
import WorkspaceContext from './WorkspaceContext';


const WorkspaceTypeIcon = ({ type }: { type: WorkspaceType }) => {
  switch (type) {
    case 'website':
      return <Globe className="h-4 w-4" />;
    case 'audience':
      return <Users className="h-4 w-4" />;
    case 'business':
      return <Target className="h-4 w-4" />;
    default:
      return <Box className="h-4 w-4" />;
  }
};

const WorkspaceCard = ({ 
  id, 
  onSelect, 
  onEdit, 
  onDelete 
}: { 
  id: string; 
  onSelect: () => void; 
  onEdit: () => void; 
  onDelete: () => void;
}) => {
  const { workspaces, currentWorkspaceId, getWorkspaceScenarios } = useWorkspaceStore();
  const workspace = workspaces[id];
  const scenarios = getWorkspaceScenarios(id);
  
  if (!workspace) return null;
  
  // Get background and text colors based on workspace type
  const getBgColor = () => {
    if (currentWorkspaceId === id) {
      return 'bg-blue-50 border-blue-200';
    }
    
    switch (workspace.type) {
      case 'website': return 'bg-green-50/30 hover:bg-green-50/60 border-green-100';
      case 'audience': return 'bg-purple-50/30 hover:bg-purple-50/60 border-purple-100';
      case 'business': return 'bg-amber-50/30 hover:bg-amber-50/60 border-amber-100';
      default: return 'bg-slate-50/50 hover:bg-slate-50 border-slate-100';
    }
  };
  
  const getIconBgColor = () => {
    switch (workspace.type) {
      case 'website': return 'bg-green-100 text-green-700';
      case 'audience': return 'bg-purple-100 text-purple-700';
      case 'business': return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };
  
  return (
    <Card className={`border transition-all ${getBgColor()}`}>
      <CardHeader className="p-4 pb-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${getIconBgColor()}`}>
              <WorkspaceTypeIcon type={workspace.type} />
            </div>
            <div>
              <CardTitle className="text-base">{workspace.name}</CardTitle>
              <CardDescription className="text-xs">
                {new Date(workspace.updatedAt).toLocaleDateString()} • {scenarios.length} scenariusze
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEdit}
              className="h-8 w-8 text-slate-400 hover:text-blue-500"
              aria-label="Edytuj workspace"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDelete}
              className="h-8 w-8 text-slate-400 hover:text-red-500"
              aria-label="Usuń workspace"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {workspace.description && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{workspace.description}</p>
        )}
        
        {/* Context preview */}
        <div className="mt-3 flex flex-wrap gap-2">
          {workspace.context.url && (
            <Badge variant="outline" className="bg-blue-50 border-blue-200 flex items-center gap-1">
              <Globe className="h-3 w-3" /> 
              <span className="truncate max-w-40">{workspace.context.url}</span>
            </Badge>
          )}
          {workspace.context.audience && (
            <Badge variant="outline" className="bg-purple-50 border-purple-200 flex items-center gap-1">
              <Users className="h-3 w-3" /> 
              <span className="truncate max-w-40">{workspace.context.audience}</span>
            </Badge>
          )}
          {workspace.context.businessGoal && (
            <Badge variant="outline" className="bg-amber-50 border-amber-200 flex items-center gap-1">
              <Target className="h-3 w-3" /> 
              <span className="truncate max-w-40">{workspace.context.businessGoal}</span>
            </Badge>
          )}
          
          {/* Show scenario count if there are scenarios */}
          {scenarios.length > 0 && (
            <Badge variant="outline" className="bg-slate-50 border-slate-200 flex items-center gap-1">
              <Layers className="h-3 w-3" /> 
              <span>{scenarios.length} scenariusze</span>
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="p-4 pt-2">
        <Button
          onClick={onSelect}
          className="w-full"
          variant={currentWorkspaceId === id ? "default" : "outline"}
        >
          {currentWorkspaceId === id ? 'Aktywny workspace' : 'Wybierz workspace'}
        </Button>
      </CardFooter>
    </Card>
  );
};

const CreateWorkspaceForm = ({ 
  onSubmit, 
  onCancel 
}: { 
  onSubmit: (name: string, type: WorkspaceType, description: string, initialContext: any) => void;
  onCancel: () => void;
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<WorkspaceType>('website');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [audience, setAudience] = useState('');
  const [businessGoal, setBusinessGoal] = useState('');
  
  const handleSubmit = () => {
    const initialContext: Record<string, any> = {};
    
    if (url) initialContext.url = url;
    if (audience) initialContext.audience = audience;
    if (businessGoal) initialContext.businessGoal = businessGoal;
    
    onSubmit(name, type, description, initialContext);
  };
  
  return (
    <div className="space-y-5">
      <div>
        <Label htmlFor="workspaceName">Nazwa workspace</Label>
        <Input 
          id="workspaceName"
          value={name} 
          onChange={(e) => setName(e.target.value)}
          placeholder="Np. AnalitykaMojejStrony" 
          className="mt-1.5"
          autoFocus
        />
      </div>
      
      <div>
        <Label htmlFor="workspaceType">Typ workspace</Label>
        <Select value={type} onValueChange={(value) => setType(value as WorkspaceType)}>
          <SelectTrigger id="workspaceType" className="mt-1.5">
            <SelectValue placeholder="Wybierz typ workspace" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="website">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-green-600" /> 
                <span>Analiza strony WWW</span>
              </div>
            </SelectItem>
            <SelectItem value="audience">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" /> 
                <span>Grupa docelowa</span>
              </div>
            </SelectItem>
            <SelectItem value="business">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-amber-600" /> 
                <span>Cel biznesowy</span>
              </div>
            </SelectItem>
            <SelectItem value="general">
              <div className="flex items-center gap-2">
                <Box className="h-4 w-4 text-slate-600" /> 
                <span>Ogólny</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="description">Opis (opcjonalnie)</Label>
        <Textarea 
          id="description"
          value={description} 
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Krótki opis tego workspace" 
          className="mt-1.5 min-h-20" 
        />
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-1.5">
          <span>Początkowy kontekst</span>
          <Badge variant="outline" className="font-normal text-xs">Opcjonalnie</Badge>
        </h3>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="url" className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5 text-blue-500" />
              <span>URL strony</span>
            </Label>
            <Input 
              id="url"
              value={url} 
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com" 
              className="mt-1.5"
            />
          </div>
          
          <div>
            <Label htmlFor="audience" className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-purple-500" />
              <span>Grupa docelowa</span>
            </Label>
            <Input 
              id="audience"
              value={audience} 
              onChange={(e) => setAudience(e.target.value)}
              placeholder="Np. Mężczyźni 30-45 lat, zainteresowani sportem" 
              className="mt-1.5"
            />
          </div>
          
          <div>
            <Label htmlFor="businessGoal" className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-amber-500" />
              <span>Cel biznesowy</span>
            </Label>
            <Input 
              id="businessGoal"
              value={businessGoal} 
              onChange={(e) => setBusinessGoal(e.target.value)}
              placeholder="Np. Zwiększenie konwersji formularza o 20%" 
              className="mt-1.5"
            />
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={onCancel}>
          Anuluj
        </Button>
        <Button onClick={handleSubmit} disabled={!name}>
          Utwórz workspace
        </Button>
      </div>
    </div>
  );
};

const WorkspaceManagement: React.FC = () => {
  const { 
    workspaces, 
    currentWorkspaceId, 
    setCurrentWorkspace,
    createWorkspace,
    deleteWorkspace,
    exportWorkspaceToJson,
    importWorkspaceFromJson
  } = useWorkspaceStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editWorkspaceId, setEditWorkspaceId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  
  const workspacesList = Object.values(workspaces).sort((a, b) => b.updatedAt - a.updatedAt);
  
  const handleCreateWorkspace = (name: string, type: WorkspaceType, description: string, initialContext: any) => {
    createWorkspace(name, type, description, initialContext);
    setShowCreateModal(false);
  };
  
  const handleEditWorkspace = () => {
    // Edit functionality would use a similar form to create
    // For now, we'll just close the modal
    setEditWorkspaceId(null);
  };
  
  const handleDeleteWorkspace = () => {
    if (showDeleteConfirm) {
      deleteWorkspace(showDeleteConfirm);
      setShowDeleteConfirm(null);
    }
  };
  
  const handleExportWorkspace = () => {
    if (!currentWorkspaceId) return;
    
    const data = exportWorkspaceToJson(currentWorkspaceId);
    if (data) {
      exportToJsonFile(data, `workspace_${workspaces[currentWorkspaceId].name.toLowerCase().replace(/\s+/g, '_')}.json`);
    }
    setShowExportModal(false);
  };
  
  const handleImportWorkspace = async (file: File) => {
    try {
      const data = await parseJsonFile(file);
      const workspaceId = importWorkspaceFromJson(data);
      
      if (workspaceId) {
        setCurrentWorkspace(workspaceId);
      }
      setShowImportModal(false);
    } catch (error) {
      console.error('Error importing workspace:', error);
      alert('Failed to import workspace. The file format may be invalid.');
    }
  };
  
  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader className="p-4 pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Globe className="h-5 w-5 text-blue-500" />
            Zarządzanie workspaces
          </CardTitle>
          <CardDescription>
            Workspaces pozwalają na organizację scenariuszy i definiowanie wspólnego kontekstu
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="w-full"
              size="lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              Utwórz nowy workspace
            </Button>
            
            <div className="grid grid-cols-2 gap-2">
              <Button 
                onClick={() => setShowExportModal(true)}
                className="w-full"
                disabled={!currentWorkspaceId}
                variant="outline"
                size="lg"
              >
                <FileJson className="h-4 w-4 mr-2" />
                Eksportuj
              </Button>
              
              <Button
                onClick={() => setShowImportModal(true)}
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
      
      {/* Current workspace context */}
      {currentWorkspaceId && (
        <MCard
          title={
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-blue-500" />
              <span>Aktywny kontekst workspace</span>
            </div>
          }
          description="Kontekst dostępny dla wszystkich scenariuszy w tym workspace"
        >
          <WorkspaceContext workspaceId={currentWorkspaceId} />
        </MCard>
      )}
      
      {/* Workspaces list */}
      <MCard
        title={
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-green-500" />
            <span>Przestrzenie robocze</span>
          </div>
        }
        description="Zarządzaj swoimi przestrzeniami analizy"
      >
        {workspacesList.length === 0 ? (
          <div className="text-center py-8 px-6 text-slate-500 bg-slate-50/50 rounded-md border border-dashed">
            <div className="flex flex-col items-center gap-2">
              <Globe className="h-12 w-12 text-slate-300" />
              <p className="text-slate-600 font-medium">Brak przestrzeni roboczych</p>
              <p className="text-slate-500 text-sm">Utwórz swoją pierwszą przestrzeń, aby rozpocząć analizę.</p>
            </div>
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="mt-4"
            >
              <Plus className="h-4 w-4 mr-2" />
              Utwórz workspace
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {workspacesList.map(workspace => (
              <WorkspaceCard
                key={workspace.id}
                id={workspace.id}
                onSelect={() => setCurrentWorkspace(workspace.id)}
                onEdit={() => setEditWorkspaceId(workspace.id)}
                onDelete={() => setShowDeleteConfirm(workspace.id)}
              />
            ))}
          </div>
        )}
      </MCard>
      
      {/* Create workspace modal */}
      <MDialog
        title="Utwórz nowy workspace"
        description="Zdefiniuj przestrzeń roboczą dla swojej analizy"
        isOpen={showCreateModal}
        onOpenChange={setShowCreateModal}
      >
        <CreateWorkspaceForm
          onSubmit={handleCreateWorkspace}
          onCancel={() => setShowCreateModal(false)}
        />
      </MDialog>
      
      {/* Edit workspace modal */}
      <MDialog
        title="Edytuj workspace"
        description="Zmień ustawienia przestrzeni roboczej"
        isOpen={!!editWorkspaceId}
        onOpenChange={(open) => !open && setEditWorkspaceId(null)}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setEditWorkspaceId(null)}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleEditWorkspace}
            >
              Zapisz zmiany
            </Button>
          </>
        }
      >
        {/* Edit form would go here - similar to create form */}
        <p>Edycja przestrzeni roboczej...</p>
      </MDialog>
      
      {/* Delete confirmation */}
      <MDialog
        title="Usunąć workspace?"
        description={`Czy na pewno chcesz usunąć workspace "${showDeleteConfirm ? workspaces[showDeleteConfirm]?.name : ''}"? Operacja jest nieodwracalna.`}
        isOpen={!!showDeleteConfirm}
        onOpenChange={(open) => !open && setShowDeleteConfirm(null)}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowDeleteConfirm(null)}
            >
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteWorkspace}
            >
              Usuń workspace
            </Button>
          </>
        }
      >
        <div className="p-4 bg-red-50 rounded-md border border-red-100 text-red-600">
          <p>Usunięcie workspace nie usunie powiązanych scenariuszy, ale utracisz zdefiniowany kontekst analizy.</p>
        </div>
      </MDialog>
      
      {/* Export modal */}
      <MDialog
        title="Eksportuj workspace"
        description="Zapisz aktualny workspace wraz ze wszystkimi scenariuszami"
        isOpen={showExportModal}
        onOpenChange={setShowExportModal}
        footer={
          <>
            <Button 
              variant="outline" 
              onClick={() => setShowExportModal(false)}
            >
              Anuluj
            </Button>
            <Button
              onClick={handleExportWorkspace}
              disabled={!currentWorkspaceId}
            >
              Eksportuj
            </Button>
          </>
        }
      >
        {currentWorkspaceId && (
          <div className="space-y-3">
            <div className="p-4 bg-blue-50 rounded-md border border-blue-100">
              <p className="font-medium">{workspaces[currentWorkspaceId].name}</p>
              <p className="text-sm text-slate-600 mt-1">{workspaces[currentWorkspaceId].description}</p>
            </div>
            
            <p className="text-sm">Eksport zawiera:</p>
            <ul className="text-sm list-disc list-inside space-y-1">
              <li>Konfigurację workspace</li>
              <li>Kontekst analizy</li>
              <li>Wszystkie powiązane scenariusze</li>
            </ul>
          </div>
        )}
      </MDialog>
      
      {/* Import modal */}
      <MDialog
        title="Importuj workspace"
        description="Wczytaj workspace z pliku JSON"
        isOpen={showImportModal}
        onOpenChange={setShowImportModal}
      >
        <div className="space-y-4">
          <p className="text-sm">Wybierz plik JSON zawierający eksportowany wcześniej workspace:</p>
          
          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImportWorkspace(file);
                }
              }}
              className="block w-full text-sm text-slate-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
          </div>
          
          <p className="text-sm text-slate-500">
            Import doda nowy workspace do istniejących workspaces.
          </p>
        </div>
      </MDialog>
    </div>
  );
};

export default WorkspaceManagement;