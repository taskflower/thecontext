// src/modules/workspaces/WorkspacesList.tsx
import React from "react";
import { useAppStore } from "../store";
import { ItemList } from "@/components/APPUI";
import { Workspace } from "../types";
import { FolderOpen, MoreHorizontal, Plus, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDialogManager } from "@/hooks/useDialogManager";
import { useNavigate } from "react-router-dom";

export const WorkspacesList: React.FC = () => {
  const items = useAppStore((state) => state.items);
  const selected = useAppStore((state) => state.selected);
  const selectWorkspace = useAppStore((state) => state.selectWorkspace);
  const deleteWorkspace = useAppStore((state) => state.deleteWorkspace);
  const addWorkspace = useAppStore((state) => state.addWorkspace);
  const updateWorkspace = useAppStore((state) => state.updateWorkspace);
  const setActiveTab = useAppStore((state) => state.setActiveTab);
  useAppStore((state) => state.stateVersion);

  const { createDialog } = useDialogManager();

  const handleAddWorkspace = () => {
    createDialog(
      "New Workspace",
      [
        {
          name: "title",
          placeholder: "Workspace name",
          type: "text",
          validation: {
            required: true,
            minLength: 1,
            maxLength: 50,
          },
        },
      ],
      (data) => {
        if (data.title?.toString().trim()) {
          addWorkspace({
            title: String(data.title),
          });
        }
      },
      {
        confirmText: "Add",
        size: "sm",
      }
    );
  };

  const handleEditWorkspace = (workspace: Workspace) => {
    createDialog(
      "Edit Workspace",
      [
        {
          name: "title",
          placeholder: "Workspace name",
          type: "text",
          value: workspace.title,
          validation: {
            required: true,
            minLength: 1,
            maxLength: 50,
          },
        },
        {
          name: "slug",
          placeholder: "URL slug",
          type: "text",
          value: workspace.slug || "",
          validation: {
            required: true,
            minLength: 1,
            maxLength: 50,
            pattern: /^[a-z0-9-]+$/,
          },
        },
      ],
      (data) => {
        if (data.title?.toString().trim() && data.slug?.toString().trim()) {
          updateWorkspace(workspace.id, {
            title: String(data.title),
            slug: String(data.slug),
          });
        }
      },
      {
        confirmText: "Update",
        size: "sm",
      }
    );
  };

  // Tylko wybiera workspace bez przełączania zakładki
  const handleWorkspaceSelect = (workspaceId: string) => {
    selectWorkspace(workspaceId);
  };

  // Przełączenie na scenariusze i wybór workspace
  const handleGoToScenarios = (e: React.MouseEvent, workspaceId: string) => {
    e.stopPropagation();
    selectWorkspace(workspaceId);
    setActiveTab("scenarios");
  };

  // Obsługa przycisku opcji
  const handleOptionsClick = (e: React.MouseEvent, workspace: Workspace) => {
    e.stopPropagation();
    handleEditWorkspace(workspace);
  };

  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <h3 className="text-sm font-medium">Workspaces</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleAddWorkspace}
          className="h-7 w-7 rounded-full hover:bg-muted"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-auto">
        <ItemList<Workspace>
          items={items}
          selected={selected.workspace}
          onClick={handleWorkspaceSelect}
          onDelete={deleteWorkspace}
          renderItem={(item) => (
            <div className="text-xs font-medium flex items-center justify-between w-full">
              <div className="flex items-center">
                <FolderOpen className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                {item.title}
              </div>
              <div className="flex items-center gap-1">
                {/* Przycisk do przejścia na scenariusze */}

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Przejdź do scenariuszy"
                  onClick={() => navigate(`/${item.slug}`)}
                >
                  <Layers className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Przejdź do scenariuszy"
                  onClick={(e) => handleGoToScenarios(e, item.id)}
                >
                  <Layers className="h-3.5 w-3.5" />
                </Button>
                {/* Przycisk opcji */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  title="Opcje"
                  onClick={(e) => handleOptionsClick(e, item)}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
          height="h-full"
        />
      </div>
    </div>
  );
};
