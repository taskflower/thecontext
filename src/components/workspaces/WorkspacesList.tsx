/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/workspaces/WorkspacesList.tsx
import React from 'react';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Folder, Plus, Trash2, Copy, ExternalLink, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatDistanceToNow } from 'date-fns';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export const WorkspacesList: React.FC = () => {
  const { 
    workspaces, 
    currentWorkspaceId, 
    createWorkspace, 
    setCurrentWorkspace,
    deleteWorkspace,
    duplicateWorkspace
  } = useWorkspaceStore();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState('');
  const [newWorkspaceDescription, setNewWorkspaceDescription] = React.useState('');
  
  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName, newWorkspaceDescription);
      setNewWorkspaceName('');
      setNewWorkspaceDescription('');
      setIsCreateDialogOpen(false);
    }
  };
  
  const workspaceList = Object.values(workspaces).sort((a:any, b:any) => b.updatedAt - a.updatedAt);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Workspaces</h2>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Workspace
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Workspace</DialogTitle>
              <DialogDescription>
                Create a new workspace to organize your scenarios and prompts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name" 
                  value={newWorkspaceName} 
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  placeholder="My Workspace"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea 
                  id="description" 
                  value={newWorkspaceDescription} 
                  onChange={(e) => setNewWorkspaceDescription(e.target.value)}
                  placeholder="What this workspace is for..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreateWorkspace} disabled={!newWorkspaceName.trim()}>
                Create Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {workspaceList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-slate-500">
            <Folder className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p>No workspaces yet. Create your first workspace to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaceList.map((workspace:any) => (
            <Card 
              key={workspace.id} 
              className={currentWorkspaceId === workspace.id ? 'border-2 border-blue-500' : ''}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-blue-500" />
                  {workspace.name}
                </CardTitle>
                <CardDescription>
                  {workspace.description || 'No description'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Updated {formatDistanceToNow(workspace.updatedAt, { addSuffix: true })}
                  </div>
                  <div>
                    {workspace.scenarioIds.length} {workspace.scenarioIds.length === 1 ? 'scenario' : 'scenarios'}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => duplicateWorkspace(workspace.id)}
                    title="Duplicate workspace"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteWorkspace(workspace.id)}
                    title="Delete workspace"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <Button 
                  onClick={() => setCurrentWorkspace(workspace.id)}
                  disabled={currentWorkspaceId === workspace.id}
                >
                  {currentWorkspaceId === workspace.id ? 'Current' : 'Open'}
                  {currentWorkspaceId !== workspace.id && <ExternalLink className="h-4 w-4 ml-2" />}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};



