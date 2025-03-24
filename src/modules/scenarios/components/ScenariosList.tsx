import React, { useState } from "react";
import { PlusCircle, MoreHorizontal, X, GitBranch, GitMerge, Edit } from "lucide-react";
import { useAppStore } from "../../store";
import { Scenario } from "../types";
import { cn } from "@/utils/utils";
import AddNewScenario from "./AddNewScenario";
import EditScenario from "./EditScenario";

const ScenariosList: React.FC = () => {
  const selectedWorkspaceId = useAppStore((state) => state.selected.workspace);
  const selectedScenarioId = useAppStore((state) => state.selected.scenario);
  const workspace = useAppStore((state) => 
    state.items.find((w) => w.id === selectedWorkspaceId)
  );
  const scenarios = workspace?.children || [];
  
  const selectScenario = useAppStore((state) => state.selectScenario);
  const deleteScenario = useAppStore((state) => state.deleteScenario);
  
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [scenarioToEdit, setScenarioToEdit] = useState<string>("");
  
  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };
  
  const handleEditScenario = (id: string) => {
    setScenarioToEdit(id);
    setIsEditDialogOpen(true);
    setMenuOpen(null);
  };
  
  if (!selectedWorkspaceId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Select a workspace first</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-base font-medium">Scenarios</h2>
          {workspace && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Workspace: {workspace.title}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Add scenario"
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {scenarios.length > 0 ? (
          <ul className="space-y-0.5">
            {scenarios.map((scenario) => (
              <ScenarioItem
                key={scenario.id}
                scenario={scenario}
                isSelected={scenario.id === selectedScenarioId}
                onSelect={selectScenario}
                onDelete={deleteScenario}
                onEdit={handleEditScenario}
                menuOpen={menuOpen === scenario.id}
                toggleMenu={() => toggleMenu(scenario.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            <p className="text-sm">No scenarios found</p>
            <p className="text-xs mt-1">Create a new scenario to get started</p>
          </div>
        )}
      </div>
      
      {/* Add new scenario dialog */}
      <AddNewScenario
        isOpen={isAddDialogOpen}
        setIsOpen={setIsAddDialogOpen}
      />
      
      {/* Edit scenario dialog */}
      <EditScenario
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        scenarioId={scenarioToEdit}
      />
    </div>
  );
};

interface ScenarioItemProps {
  scenario: Scenario;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  menuOpen: boolean;
  toggleMenu: () => void;
}

const ScenarioItem: React.FC<ScenarioItemProps> = ({
  scenario,
  isSelected,
  onSelect,
  onDelete,
  onEdit,
  menuOpen,
  toggleMenu,
}) => {
  return (
    <li
      className={cn(
        "group flex items-center justify-between px-2 py-2 rounded-md",
        isSelected 
          ? "bg-primary/10 text-primary" 
          : "hover:bg-muted/50 text-foreground"
      )}
    >
      <button
        className="flex items-center flex-1 min-w-0 text-left"
        onClick={() => onSelect(scenario.id)}
      >
        <div className="mr-2">
          {isSelected ? (
            <GitMerge className="h-4 w-4" />
          ) : (
            <GitBranch className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="truncate text-sm font-medium">{scenario.name}</span>
            <span className="ml-2 text-xs text-muted-foreground">
              ({scenario.children?.length || 0} nodes)
            </span>
          </div>
          {scenario.description && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">{scenario.description}</p>
          )}
        </div>
      </button>
      
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleMenu();
          }}
          className={cn(
            "w-7 h-7 flex items-center justify-center rounded-md text-muted-foreground",
            menuOpen 
              ? "bg-muted text-foreground" 
              : "opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-muted"
          )}
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
        
        {menuOpen && (
          <div className="absolute right-0 mt-1 w-36 bg-popover border border-border rounded-md shadow-md z-10">
            <button
              onClick={() => onEdit(scenario.id)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => onDelete(scenario.id)}
              className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-muted flex items-center"
            >
              <X className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>
    </li>
  );
};

export default ScenariosList;