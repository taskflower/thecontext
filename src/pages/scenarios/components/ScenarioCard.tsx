// src/pages/scenarios/components/ScenarioCard.tsx
import { useState } from "react";
import { Pencil, Trash2, FolderOpen, Link2, ExternalLink } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Scenario } from "@/types";
import { useDataStore, useScenarioStore } from "@/store";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Progress,
} from "@/components/ui";


interface ScenarioCardProps {
  scenario: Scenario;
  navigateToFolder: (folderId: string) => void;
  setActiveTab: (tab: "dashboard" | "tasks" | "documents") => void;
  toggleEditScenarioModal: (scenario: Scenario) => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  navigateToFolder,
  toggleEditScenarioModal,
}) => {
  const { folders } = useDataStore();
  const { deleteScenario } = useScenarioStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { lang } = useParams();

  // Function to navigate to scenario detail
  const handleNavigateToDetail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/admin/${lang}/scenarios/${scenario.id}`);
    setIsMenuOpen(false);
  };

  const handleViewFolder = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (scenario.folderId) {
      navigateToFolder(scenario.folderId);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleEditScenarioModal(scenario);
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${scenario.title}"?`)) {
      deleteScenario(scenario.id);
    }
    setIsMenuOpen(false);
  };

  // Check if folder exists - if not, display an error state
  const folderExists = folders.some((f) => f.id === scenario.folderId);

  // Check if scenario has connections
  const hasConnections =
    scenario.connections && scenario.connections.length > 0;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div
          onClick={handleNavigateToDetail}
          className="cursor-pointer hover:text-primary transition-colors"
        >
          <CardTitle className="text-base">{scenario.title}</CardTitle>
          <CardDescription>{scenario.description}</CardDescription>
        </div>
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <span className="sr-only">Open menu</span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM13.625 7.5C13.625 8.12132 13.1213 8.625 12.5 8.625C11.8787 8.625 11.375 8.12132 11.375 7.5C11.375 6.87868 11.8787 6.375 12.5 6.375C13.1213 6.375 13.625 6.87868 13.625 7.5Z"
                  fill="currentColor"
                  fillRule="evenodd"
                  clipRule="evenodd"
                ></path>
              </svg>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleNavigateToDetail}>
              <ExternalLink size={16} className="mr-2" />
              Details
            </DropdownMenuItem>
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
      </CardHeader>

      <CardContent className="pb-2">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Progress</span>
          <span>{scenario.progress}%</span>
        </div>
        <Progress value={scenario.progress} className="h-2 mb-4" />

        {/* Add connections indicator if present */}
        {hasConnections && (
          <div className="flex items-center space-x-1 mb-2 text-xs text-muted-foreground">
            <Link2 size={14} />
            <span>
              Connected with {scenario.connections?.length}{" "}
              {scenario.connections?.length === 1 ? "scenario" : "scenarios"}
            </span>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between pt-2 border-t">
        <div className="text-sm text-muted-foreground">
          Tasks: {scenario.completedTasks}/{scenario.tasks}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary flex items-center"
          onClick={handleViewFolder}
          disabled={!folderExists}
          type="button"
        >
          <FolderOpen size={16} />
          Folder View
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;