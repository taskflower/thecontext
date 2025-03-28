// src/components/frontApp/ScenarioMeta.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter as FilterIcon } from "lucide-react";
import { FilterStatus } from "@/modules/filters";
import { useAppStore } from "@/modules/store";

interface ScenarioMetaProps {
  scenarioId?: string; // Make it optional since we can get from store
  childrenCount?: number; // Make optional if we can calculate from store
  onFilterClick: (e: React.MouseEvent, scenarioId: string) => void;
}

const ScenarioMeta: React.FC<ScenarioMetaProps> = ({
  scenarioId,
  childrenCount,
  onFilterClick,
}) => {
  // Get current scenario from store if not provided via props
  const selectedScenario = useAppStore((state) => state.selected.scenario);
  const currentScenarioId = scenarioId || selectedScenario;

  // Get current scenario to calculate children count if not provided
  const currentScenario = useAppStore((state) => {
    if (!childrenCount) {
      const scenario = state.getCurrentScenario();
      return scenario;
    }
    return null;
  });

  // Use provided childrenCount or calculate from current scenario
  const nodeCount = childrenCount || currentScenario?.children?.length || 0;

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        title="Manage Filters"
        onClick={(e) => onFilterClick(e, currentScenarioId)}
      >
        <FilterIcon className="h-3.5 w-3.5" />
      </Button>
      <FilterStatus
        onClick={(e) => onFilterClick(e, currentScenarioId)}
        className="cursor-pointer"
      />
      <Badge variant="secondary" className="text-xs">
        {nodeCount} nodes
      </Badge>
    </div>
  );
};

export default ScenarioMeta;
