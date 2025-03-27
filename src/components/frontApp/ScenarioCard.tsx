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
import { CheckCircle, Clock, ArrowRight, Play } from "lucide-react";
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
          <CardTitle className="text-base sm:text-lg break-words">{scenario.name}</CardTitle>
         
        </div>
        <CardDescription className="text-xs sm:text-sm line-clamp-2">
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
        </div>
      </CardContent>
      <CardFooter className="pt-3">
        {isCurrentScenario ? (
          <Button
            className="w-full gap-2 text-xs sm:text-sm py-1 sm:py-2"
            onClick={onStartFlow}
            disabled={!isActive}
          >
            <Play className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Start Flow
          </Button>
        ) : (
          <Button
            variant="secondary"
            className="w-full gap-2 text-xs sm:text-sm py-1 sm:py-2"
            onClick={() => onSelectScenario(scenario.id)}
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