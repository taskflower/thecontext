// src/components/scenarios/ScenarioCard.tsx
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Trash2,
  Copy,
  ExternalLink,
  Clock,
  Cog,
  MoreVertical,
  Network,
  Edit,
  Filter,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useScenarioStore } from "@/stores/scenarioStore";
import { NavLink } from "react-router-dom";

import { scenarioMatchesFilters, addFilterFromScenario, useFilterStore } from "./FilterComponents";
import { Scenario } from "@/types/common";
import { ScenarioNodeCount } from "./ScenarioNodeCount";


interface ScenarioCardProps {
  scenario: Scenario;
  onEdit: (scenarioId: string) => void;
}

export const ScenarioCard: React.FC<ScenarioCardProps> = ({
  scenario,
  onEdit,
}) => {
  const {
    currentScenarioId,
    setCurrentScenario,
    deleteScenario,
    duplicateScenario,
  } = useScenarioStore();
  const { filteringEnabled } = useFilterStore();

  const matchesFilter = scenarioMatchesFilters(scenario);
  const hasFilters =
    scenario.context &&
    scenario.context.filterConditions &&
    scenario.context.filterConditions.length > 0;

  return (
    <Card
      className={`
        ${currentScenarioId === scenario.id ? "border-primary" : "border-card"}
        ${!matchesFilter && filteringEnabled ? "opacity-50" : ""}
      `}
    >
      <CardHeader className="relative">
        <CardTitle className="flex items-center gap-2">
          <Cog className="h-5 w-5 text-black" />
          {scenario.name}
        </CardTitle>
        <CardDescription>
          {scenario.description || "No description"}
        </CardDescription>

        {hasFilters && (
          <Badge
            variant="outline"
            className="absolute top-4 right-4 bg-blue-50"
            title="This scenario has filter conditions"
          >
            <Filter className="h-3 w-3 mr-1" />
            Filtered
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-sm text-slate-500 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Updated {formatDistanceToNow(scenario.updatedAt, { addSuffix: true })}
          </div>
          <div>
            <ScenarioNodeCount scenarioId={scenario.id} />
          </div>
          {scenario.templateId && (
            <Badge variant="outline" className="bg-blue-50">
              From template
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <div>
          {currentScenarioId === scenario.id && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" title="Tools">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => onEdit(scenario.id)}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => duplicateScenario(scenario.id)}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Duplicate
                </DropdownMenuItem>
                {hasFilters && (
                  <DropdownMenuItem
                    onClick={() => addFilterFromScenario(scenario)}
                    className="flex items-center gap-2"
                  >
                    <Filter className="h-4 w-4" />
                    Use as Filter
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => deleteScenario(scenario.id)}
                  className="flex items-center gap-2 text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <div className="flex gap-2">
          {currentScenarioId === scenario.id && (
            <NavLink to="/flow-editor">
              <Button variant="outline" title="Flow Editor">
                <Network className="h-4 w-4 mr-2" /> Flow Editor
              </Button>
            </NavLink>
          )}
          {currentScenarioId !== scenario.id ? (
            <Button
              variant="outline"
              onClick={() => setCurrentScenario(scenario.id)}
              disabled={filteringEnabled && !matchesFilter}
              title={
                filteringEnabled && !matchesFilter
                  ? "This scenario doesn't match your active filters"
                  : undefined
              }
            >
              Open
              <ExternalLink className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button variant="outline" disabled>
              Current
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};