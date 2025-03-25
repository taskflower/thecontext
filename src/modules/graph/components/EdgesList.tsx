import React, { useState } from "react";
import { PlusCircle, MoreHorizontal, X, ArrowRight, ArrowRightCircle, Edit } from "lucide-react";
import { useAppStore } from "../../store";
import { Edge } from "../types";
import { cn } from "@/utils/utils";
import AddNewEdge from "./AddNewEdge";
import EditEdge from "./EditEdge";


const EdgesList: React.FC = () => {
  const selectedWorkspaceId = useAppStore((state) => state.selected.workspace);
  const selectedScenarioId = useAppStore((state) => state.selected.scenario);
  
  const workspace = useAppStore((state) => 
    state.items.find((w) => w.id === selectedWorkspaceId)
  );
  const scenario = workspace?.children.find((s) => s.id === selectedScenarioId);
  const edges = scenario?.edges || [];
  const nodes = scenario?.children || [];
  
  const deleteEdge = useAppStore((state) => state.deleteEdge);
  
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [edgeToEdit, setEdgeToEdit] = useState<string>("");
  
  const toggleMenu = (id: string) => {
    setMenuOpen(menuOpen === id ? null : id);
  };
  
  const handleEditEdge = (id: string) => {
    setEdgeToEdit(id);
    setIsEditDialogOpen(true);
    setMenuOpen(null);
  };
  
  // Find node labels by ID for display
  const getNodeLabel = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    return node?.label || id;
  };
  
  if (!selectedScenarioId) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Select a scenario first</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h2 className="text-base font-medium">Edges</h2>
          {scenario && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Scenario: {scenario.name}
            </p>
          )}
        </div>
        <button
          onClick={() => setIsAddDialogOpen(true)}
          className="w-8 h-8 flex items-center justify-center rounded-md text-muted-foreground hover:text-foreground hover:bg-muted"
          aria-label="Add edge"
          disabled={nodes.length < 2}
        >
          <PlusCircle className="h-5 w-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        {edges.length > 0 ? (
          <ul className="space-y-0.5">
            {edges.map((edge) => (
              <EdgeItem
                key={edge.id}
                edge={edge}
                sourceLabel={getNodeLabel(edge.source)}
                targetLabel={getNodeLabel(edge.target)}
                onDelete={deleteEdge}
                menuOpen={menuOpen === edge.id}
                toggleMenu={() => toggleMenu(edge.id)}
                onEdit={() => handleEditEdge(edge.id)}
              />
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            <p className="text-sm">No edges found</p>
            <p className="text-xs mt-1">Create a new edge to connect nodes</p>
          </div>
        )}
      </div>
      
      {/* Add New Edge Dialog */}
      <AddNewEdge isOpen={isAddDialogOpen} setIsOpen={setIsAddDialogOpen} />
      
      {/* Edit Edge Dialog */}
      <EditEdge
        isOpen={isEditDialogOpen}
        setIsOpen={setIsEditDialogOpen}
        edgeId={edgeToEdit}
      />
    </div>
  );
};

interface EdgeItemProps {
  edge: Edge;
  sourceLabel: string;
  targetLabel: string;
  onDelete: (id: string) => void;
  menuOpen: boolean;
  toggleMenu: () => void;
  onEdit: () => void;
}

const EdgeItem: React.FC<EdgeItemProps> = ({
  edge,
  sourceLabel,
  targetLabel,
  onDelete,
  menuOpen,
  toggleMenu,
  onEdit
}) => {
  return (
    <li className="group flex items-center justify-between px-3 py-2 rounded-md hover:bg-muted/50">
      <div className="flex items-center flex-1 min-w-0">
        <ArrowRight className="h-4 w-4 mr-2 flex-shrink-0 text-muted-foreground" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <div className="flex items-center text-sm space-x-1">
              <span className="font-medium truncate max-w-[120px]">{sourceLabel}</span>
              <ArrowRightCircle className="h-3 w-3 text-muted-foreground" />
              <span className="font-medium truncate max-w-[120px]">{targetLabel}</span>
            </div>
          </div>
          {edge.label && (
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              Label: {edge.label}
            </p>
          )}
        </div>
      </div>
      
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
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </button>
            <button
              onClick={() => onDelete(edge.id)}
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

export default EdgesList;