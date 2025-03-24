// src/modules/filters/components/FilterStatus.tsx
import React from "react";
import { useAppStore } from "../../store";
import {  CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/utils/utils";

interface FilterStatusProps {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const FilterStatus: React.FC<FilterStatusProps> = ({ 
  onClick, 
  className 
}) => {
  const getScenarioFilters = useAppStore(state => state.getScenarioFilters);
  const checkScenarioFilterMatch = useAppStore(state => state.checkScenarioFilterMatch);
  
  // Force component to update when state changes
  useAppStore(state => state.stateVersion);
  
  // Get filters and check match status
  const filters = getScenarioFilters();
  const activeFilters = filters.filter(f => f.enabled);
  
  if (!activeFilters.length) {
    return null;
  }
  
  const matchesFilter = checkScenarioFilterMatch();
  
  return (
    <div 
      className={cn(
        "flex items-center text-xs gap-1 rounded-md px-1.5 py-0.5 cursor-pointer",
        matchesFilter 
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        className
      )}
      onClick={onClick}
    >
      {matchesFilter ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      <span>
        {activeFilters.length} {activeFilters.length === 1 ? "filter" : "filters"}
      </span>
    </div>
  );
};

export default FilterStatus;