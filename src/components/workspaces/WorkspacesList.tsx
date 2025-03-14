/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/workspaces/WorkspacesList.tsx
import React from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Clock,
  SquareArrowLeft,
  FileCode,
  MoreVertical,
  Box,
  Copy,
  Database,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDistanceToNow } from "date-fns";
import { useWorkspaceStore } from "@/stores/workspaceStore";
import { WorkspaceExportImport } from "./WorkspaceExportImport";
import { WorkspaceContextSheet } from "./WorkspaceContextSheet";
import { NavLink } from "react-router-dom";

export const WorkspacesList: React.FC = () => {
  const {
    workspaces,
    currentWorkspaceId,
    createWorkspace,
    setCurrentWorkspace,
    deleteWorkspace,
    duplicateWorkspace,
  } = useWorkspaceStore();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = React.useState(false);
  const [isExportImportDialogOpen, setIsExportImportDialogOpen] = React.useState(false);
  const [isContextSheetOpen, setIsContextSheetOpen] = React.useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = React.useState("");
  const [newWorkspaceDescription, setNewWorkspaceDescription] = React.useState("");

  const handleCreateWorkspace = () => {
    if (newWorkspaceName.trim()) {
      createWorkspace(newWorkspaceName, newWorkspaceDescription);
      setNewWorkspaceName("");
      setNewWorkspaceDescription("");
      setIsCreateDialogOpen(false);
    }
  };

  const workspaceList = Object.values(workspaces).sort(
    (a: any, b: any) => b.updatedAt - a.updatedAt
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center space-x-2">
        <div className="flex items-center gap-2">
          <Dialog open={isExportImportDialogOpen} onOpenChange={setIsExportImportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant={"outline"}>
                <FileCode className="h-4 w-4 mr-2" />
                Export/Import
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export / Import Workspace</DialogTitle>
                <DialogDescription>
                  Exportuj lub zaimportuj dane workspace.
                </DialogDescription>
              </DialogHeader>
              <WorkspaceExportImport />
            </DialogContent>
          </Dialog>
          
        
        </div>
        <div className="flex items-center gap-2">
        <Button 
            variant="outline" 
            onClick={() => setIsContextSheetOpen(true)}
            disabled={!currentWorkspaceId}
            title="Open Container Context"
          >
            <Database className="h-4 w-4 mr-2" />
            Context
          </Button> 
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Container
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Container</DialogTitle>
              <DialogDescription>
                Create a new container to organize your scenarios and prompts.
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
              <Button
                onClick={handleCreateWorkspace}
                disabled={!newWorkspaceName.trim()}
              >
                Create Workspace
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
       </div>
      </div>

      {/* Context Sheet */}
      <WorkspaceContextSheet 
        isOpen={isContextSheetOpen} 
        onOpenChange={setIsContextSheetOpen} 
      />

      {workspaceList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center text-slate-500">
            <Box className="h-12 w-12 text-slate-300 mx-auto mb-2" />
            <p>
              No containers yet. Create your first container to get started.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaceList.map((workspace: any) => (
            <Card
              key={workspace.id}
              className={
                currentWorkspaceId === workspace.id
                  ? "border-primary"
                  : "border-card"
              }
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5 " />
                  {workspace.name}
                </CardTitle>
                <CardDescription>
                  {workspace.description || "No description"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-slate-500 space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Updated{" "}
                    {formatDistanceToNow(workspace.updatedAt, {
                      addSuffix: true,
                    })}
                  </div>
                  <div>
                    {workspace.scenarioIds.length}{" "}
                    {workspace.scenarioIds.length === 1
                      ? "scenario"
                      : "scenarios"}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  {currentWorkspaceId === workspace.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          title="Tools"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                      <DropdownMenuItem 
                          onClick={() => setIsContextSheetOpen(true)}
                          className="flex items-center gap-2"
                        >
                          <Database className="h-4 w-4" />
                          Manage Context
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => duplicateWorkspace(workspace.id)}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Duplicate
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          onClick={() => deleteWorkspace(workspace.id)}
                          className="flex items-center gap-2 text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <div className="flex gap-2">
                  {currentWorkspaceId === workspace.id && (
                    <NavLink to="/scenarios">
                      <Button variant="outline" title="Scenarios">
                        <FileCode className="h-4 w-4 " /> Scenarios
                      </Button>
                    </NavLink>
                  )}
                  <Button
                    variant="outline"
                    onClick={() => setCurrentWorkspace(workspace.id)}
                    disabled={currentWorkspaceId === workspace.id}
                  >
                    {currentWorkspaceId === workspace.id
                      ? "Selected"
                      : "Select"}
                    {currentWorkspaceId !== workspace.id && (
                      <SquareArrowLeft className="h-4 w-4 " />
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};