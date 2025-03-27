// src/components/frontApp/ScenarioMeta.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter as FilterIcon } from "lucide-react";
import { FilterStatus } from "@/modules/filters";

interface ScenarioMetaProps {
  scenarioId: string;
  childrenCount: number;
  onFilterClick: (e: React.MouseEvent, scenarioId: string) => void;
}

const ScenarioMeta: React.FC<ScenarioMetaProps> = ({ 
  scenarioId, 
  childrenCount, 
  onFilterClick 
}) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        title="Manage Filters"
        onClick={(e) => onFilterClick(e, scenarioId)}
      >
        <FilterIcon className="h-3.5 w-3.5" />
      </Button>
      <FilterStatus
        onClick={(e) => onFilterClick(e, scenarioId)}
        className="cursor-pointer"
      />
      <Badge variant="secondary" className="text-xs">
        {childrenCount} nodes
      </Badge>
    </div>
  );
};

export default ScenarioMeta;