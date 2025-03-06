// src/pages/scenarios/components/ScenarioListItem.tsx
import { FolderOpen, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Scenario } from "@/types";
import { useDataStore } from "@/store";
import { Button, Progress } from "@/components/ui";
import scenarioService from "../services/ScenarioService";
import { useToast } from "@/hooks/useToast";

interface ScenarioListItemProps {
  scenario: Scenario;
  navigateToFolder: (folderId: string) => void;
  setActiveTab: (tab: "dashboard" | "tasks" | "documents") => void;
  toggleEditScenarioModal: (scenario: Scenario) => void;
}

const ScenarioListItem: React.FC<ScenarioListItemProps> = ({
  scenario,
  navigateToFolder,
  toggleEditScenarioModal,
}) => {
  const { folders } = useDataStore();
  const { toast } = useToast();

  // Get statistics from the service
  const { completedTasks, totalTasks, progress } = scenarioService.getScenarioStats(scenario.id);

  const handleViewFolder = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scenario.folderId) {
      navigateToFolder(scenario.folderId);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleEditScenarioModal(scenario);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${scenario.title}"?`)) {
      const result = scenarioService.deleteScenario(scenario.id);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to delete scenario",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success", 
          description: "Scenario deleted successfully",
          variant: "default"
        });
      }
    }
  };

  // Sprawdzanie warunków
  const folderExists = folders.some((f) => f.id === scenario.folderId);

  return (
    <div className="grid grid-cols-12 p-3 border-b hover:bg-secondary/20 cursor-pointer">
      <div className="col-span-4 font-medium">{scenario.title}</div>
      <div className="col-span-3">
        <Progress value={progress} className="h-2" />
        <div className="text-xs text-muted-foreground mt-1">
          {progress}%
        </div>
      </div>
      <div className="col-span-2 text-muted-foreground">
        {completedTasks}/{totalTasks}
      </div>
      <div className="col-span-2 text-muted-foreground">{scenario.dueDate}</div>
      <div className="col-span-1 flex items-center justify-end">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-primary"
          onClick={handleViewFolder}
          disabled={!folderExists}
          title="View scenario folder"
          type="button"
        >
          <FolderOpen size={16} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleEdit}>
              <Pencil size={16} className="mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleDelete}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 size={16} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default ScenarioListItem;