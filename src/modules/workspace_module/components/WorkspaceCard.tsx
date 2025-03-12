// src/modules/workspaces_module/components/WorkspaceCard.tsx

import { 
  Layers, 
  Edit, 
  Trash2 
} from "lucide-react";
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceStore } from '../workspaceStore';
import { availableIcons } from './contextIconService';
import React from 'react';

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
  
  // Get the icon component for the workspace type
  const TypeIcon = availableIcons[workspace.typeIcon] || availableIcons.box;
  
  // Get background and text colors based on active state
  const getBgColor = () => {
    if (currentWorkspaceId === id) {
      return 'bg-blue-50 border-blue-200';
    }
    return 'bg-slate-50/50 hover:bg-slate-50 border-slate-100';
  };
  
  return (
    <Card className={`border transition-all ${getBgColor()}`}>
      <CardHeader className="p-4 pb-1">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-slate-100 text-slate-700">
              <TypeIcon className="h-4 w-4" />
            </div>
            <div>
              <CardTitle className="text-base">{workspace.name}</CardTitle>
              <CardDescription className="text-xs">
                {new Date(workspace.updatedAt).toLocaleDateString()} • {scenarios.length} scenarios
              </CardDescription>
            </div>
          </div>
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onEdit}
              className="h-8 w-8 text-slate-400 hover:text-blue-500"
              aria-label="Edit workspace"
            >
              <Edit className="h-4 w-4" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onDelete}
              className="h-8 w-8 text-slate-400 hover:text-red-500"
              aria-label="Delete workspace"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-2">
        {workspace.type && (
          <Badge variant="outline" className="mt-1 bg-slate-50 border-slate-200">
            {workspace.type}
          </Badge>
        )}
        
        {workspace.description && (
          <p className="mt-2 text-sm text-slate-600 line-clamp-2">{workspace.description}</p>
        )}
        
        {/* Context preview */}
        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(workspace.context || {}).map(([key, value]) => {
            // Get icon for this context key
            const ContextIcon = availableIcons[key] || availableIcons.box;
            
            return (
              <Badge key={key} variant="outline" className="bg-blue-50 border-blue-200 flex items-center gap-1">
                <ContextIcon className="h-3 w-3" />
                <span className="truncate max-w-40">
                  {typeof value === 'string' ? value : 
                   Array.isArray(value) ? `${value.length} items` :
                   typeof value === 'object' ? 'Object' : String(value)}
                </span>
              </Badge>
            );
          })}
          
          {/* Show scenario count if there are scenarios */}
          {scenarios.length > 0 && (
            <Badge variant="outline" className="bg-slate-50 border-slate-200 flex items-center gap-1">
              <Layers className="h-3 w-3" /> 
              <span>{scenarios.length} scenarios</span>
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
          {currentWorkspaceId === id ? 'Active Workspace' : 'Select Workspace'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WorkspaceCard;