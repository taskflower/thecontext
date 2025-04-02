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

import { CheckCircle,  Hourglass, Play} from "lucide-react";
import { useAppStore } from "@/modules/store";
import { Scenario } from "./types";

interface ScenarioCardProps {
  scenario: Scenario;
  onFilterClick: (e: React.MouseEvent, scenarioId: string) => void;
  onStartFlow: () => void;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ 
  scenario, 
  onStartFlow 
}) => {
  // Get actions and state from store
  const selectScenario = useAppStore((state) => state.selectScenario);
  const currentScenarioId = useAppStore((state) => state.selected.scenario);
  
  const isCurrentScenario = scenario.id === currentScenarioId;
  const isActive = scenario.matchesFilter;

  const handleCardClick = () => {
    if (!isCurrentScenario && isActive) {
      selectScenario(scenario.id);
    }
  };

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 ${
        !isActive ? "opacity-70" : "hover:shadow-md"
      } ${isCurrentScenario ? "ring-2 ring-primary" : ""} ${
        !isCurrentScenario && isActive ? "cursor-pointer" : ""
      }`}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
      <div className="h-12 md:h-24"></div>
        <div className="flex justify-between items-start">
          <CardTitle className="text-base sm:text-lg font-bold break-words">
            {scenario.name}
          </CardTitle>
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
              <Hourglass className="h-3.5 w-3.5" />
            )}
           
          </div>
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
            Start
          </Button>
        ) : (
          <div className="w-full h-8 sm:h-10"></div> // Empty space instead of the Select button
        )}
      </CardFooter>
    </Card>
  );
};

export default ScenarioCard;