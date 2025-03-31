// src/modules/filters/components/FilterStatusBanner.tsx
import React from "react";
import { cn } from "@/utils/utils";
import { FilterStatusBannerProps } from "../types";

const FilterStatusBanner: React.FC<FilterStatusBannerProps> = ({
  filtersMatch,
  activeFiltersCount
}) => {
  return (
    <div className="px-4 py-2 border-b border-border bg-muted/10">
      <div className="flex items-center">
        <div
          className={cn(
            "w-2 h-2 rounded-full mr-2",
            filtersMatch ? "bg-green-500" : "bg-yellow-500"
          )}
        />
        <span className="text-xs text-muted-foreground">
          {filtersMatch 
            ? `${activeFiltersCount} aktywny filtr${activeFiltersCount !== 1 ? 'y' : ''} - Wszystkie warunki spełnione` 
            : `${activeFiltersCount} aktywny filtr${activeFiltersCount !== 1 ? 'y' : ''} - Niektóre warunki nie spełnione`}
        </span>
      </div>
    </div>
  );
};

export default FilterStatusBanner;