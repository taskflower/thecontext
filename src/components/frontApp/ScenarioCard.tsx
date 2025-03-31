// src/components/frontApp/ScenarioCard.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, ArrowRight, Play, Filter } from "lucide-react";
import { useAppStore } from "@/modules/store";
import { Scenario } from "./types";

const formatTimeAgo = (timestamp?: string | number): string => {
  if (!timestamp) return "Recently";

  const now = new Date().getTime();
  const date = new Date(timestamp).getTime();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `about ${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? "day" : "days"} ago`;
  }
};

interface ScenarioCardProps {
  scenario: Scenario;
  onFilterClick: (e: React.MouseEvent, scenarioId: string) => void;
  onStartFlow: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  onFilterClick,
  onStartFlow 
}) => {
  // Get actions and state from store
  const selectScenario = useAppStore((state) => state.selectScenario);
  const currentScenarioId = useAppStore((state) => state.selected.scenario);
  
  const isCurrentScenario = scenario.id === currentScenarioId;
  const isActive = scenario.matchesFilter;

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 ${
        !isActive ? "opacity-70" : "hover:shadow-md"
      } ${isCurrentScenario ? "ring-2 ring-primary" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-base sm:text-lg font-bold break-words">
            {scenario.name}
          </CardTitle>
          
          {scenario.hasFilters && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-primary"
              onClick={(e) => onFilterClick(e, scenario.id)}
              title="Manage Filters"
            >
              <Filter className="h-4 w-4" />
              {scenario.activeFiltersCount ? (
                <Badge 
                  variant="secondary" 
                  className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px]"
                >
                  {scenario.activeFiltersCount}
                </Badge>
              ) : null}
            </Button>
          )}
        </div>
        <CardDescription className="text-xs sm:text-sm line-clamp-2 mt-1">
          {scenario.description || "No description available"}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            {isActive ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-600" />
            ) : (
              <Clock className="h-3.5 w-3.5" />
            )}
            <span>{isActive ? "Active" : "Inactive"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            <span className="truncate max-w-[150px]">Updated {formatTimeAgo(scenario.updatedAt)}</span>
          </div>
          
          {scenario.children && scenario.children.length > 0 && (
            <Badge variant="outline" className="text-xs font-normal">
              {scenario.children.length} nodes
            </Badge>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-3">
        {isCurrentScenario ? (
          <Button
            className="w-full gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
            onClick={onStartFlow}
            disabled={!isActive}
          >
            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Start Flow
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-full gap-2 text-xs sm:text-sm py-1.5 sm:py-2"
            onClick={() => selectScenario(scenario.id)}
            disabled={!isActive}
          >
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Select
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;