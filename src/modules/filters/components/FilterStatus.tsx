// src/modules/filters/components/FilterStatus.tsx
import React from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/utils/utils";
import { FilterStatusProps } from "../types";
import { useFilters } from "../hooks/useFilters";

export const FilterStatus: React.FC<FilterStatusProps> = ({ 
  onClick, 
  className,
  scenarioId
}) => {
  // Wykorzystanie hooka useFilters - pobieranie tylko potrzebnych danych
  const { activeFilters, filtersMatch } = useFilters(scenarioId);
  
  // Jeśli nie ma aktywnych filtrów, nie renderuj niczego
  if (activeFilters.length === 0) {
    return null;
  }
  
  return (
    <div 
      className={cn(
        "flex items-center text-xs gap-1 rounded-md px-1.5 py-0.5 cursor-pointer",
        filtersMatch 
          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" 
          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
        className
      )}
      onClick={onClick}
    >
      {filtersMatch ? (
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