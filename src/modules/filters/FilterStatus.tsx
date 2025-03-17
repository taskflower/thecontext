import React from "react";
import { useAppStore } from "../store";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, FilterIcon } from "lucide-react";

interface FilterStatusProps {
  scenarioId: string;
  onEditClick?: (e: React.MouseEvent<Element, MouseEvent>) => void;
}

export const FilterStatus: React.FC<FilterStatusProps> = ({ 
  scenarioId, 
  onEditClick 
}) => {
  const selected = useAppStore(state => state.selected);
  const getScenarioFilters = useAppStore(state => state.getScenarioFilters);
  const checkScenarioFilterMatch = useAppStore(state => state.checkScenarioFilterMatch);
  const getContextItems = useAppStore(state => state.getContextItems);
  
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  // Get filters and check match status
  const filters = getScenarioFilters(scenarioId)(useAppStore.getState());
  const contextItems = selected.workspace 
    ? getContextItems(selected.workspace)(useAppStore.getState()) 
    : [];
    
  const activeFilters = filters?.filter(f => f.enabled) || [];
  
  if (!activeFilters.length) {
    return (
      <Badge 
        variant="outline"
        className="ml-2 cursor-pointer"
        onClick={onEditClick}
      >
        <FilterIcon className="h-3 w-3 mr-1" />
        No Filters
      </Badge>
    );
  }
  
  const matchesFilter = checkScenarioFilterMatch(scenarioId, contextItems);
  
  return (
    <Badge 
      variant={matchesFilter ? "default" : "outline"}
      className={`ml-2 cursor-pointer ${matchesFilter ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
      onClick={onEditClick}
    >
      {matchesFilter ? (
        <CheckCircle className="h-3 w-3 mr-1" />
      ) : (
        <XCircle className="h-3 w-3 mr-1" />
      )}
      {activeFilters.length} {activeFilters.length === 1 ? "Filter" : "Filters"}
    </Badge>
  );
};