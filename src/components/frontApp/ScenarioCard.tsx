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
import { CheckCircle, Clock, ArrowRight, Play, Filter as FilterIcon } from "lucide-react";
import { FilterStatus } from "@/modules/filters";
import { ScenarioCardProps } from "./types";


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

const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  isCurrentScenario, 
  onFilterClick, 
  onSelectScenario, 
  onStartFlow 
}) => {
  const isActive = scenario.matchesFilter;

  return (
    <Card
      className={`overflow-hidden hover:shadow-md transition-shadow ${
        !isActive ? "opacity-70" : ""
      } ${isCurrentScenario ? "border-primary border-2" : ""}`}
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{scenario.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              title="Manage Filters"
              onClick={(e) => onFilterClick(e, scenario.id)}
            >
              <FilterIcon className="h-3.5 w-3.5" />
            </Button>
            <FilterStatus
              onClick={(e) => onFilterClick(e, scenario.id)}
              className="cursor-pointer"
            />
            <Badge variant="secondary" className="text-xs">
              {scenario.children ? scenario.children.length : 0} nodes
            </Badge>
          </div>
        </div>
        <CardDescription>
          {scenario.description || "No description available"}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
            <span>Updated {formatTimeAgo(scenario.updatedAt)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        {isCurrentScenario ? (
          <Button
            className="w-full gap-2"
            onClick={onStartFlow}
            disabled={!isActive}
          >
            <Play className="h-4 w-4" />
            Start Flow
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={() => onSelectScenario(scenario.id)}
            disabled={!isActive}
          >
            <ArrowRight className="h-4 w-4" />
            Select
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;