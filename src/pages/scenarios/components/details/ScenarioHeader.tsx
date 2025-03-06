// src/pages/scenarios/components/details/ScenarioHeader.tsx
import React from "react";
import { Calendar, ChevronLeft, Edit3, PlayCircle } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { useAdminNavigate } from "@/hooks";
import { Scenario } from "@/types";

interface ScenarioHeaderProps {
  scenario: Scenario;
  onEditClick: () => void;
}

const ScenarioHeader: React.FC<ScenarioHeaderProps> = ({
  scenario,
  onEditClick,
}) => {
  const navigate = useAdminNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "in-progress":
        return (
          <Badge className="bg-amber-100 text-amber-800">In Progress</Badge>
        );
      default:
        return <Badge className="bg-gray-100 text-gray-800">To Do</Badge>;
    }
  };

  return (
    <header className="bg-white border-b px-6 py-3">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/scenarios")}
          className="mr-4"
        >
          <ChevronLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">{scenario.title}</h1>
        <div className="ml-3">
          {getStatusBadge(
            scenario.progress === 100 ? "completed" : "in-progress"
          )}
        </div>
        {scenario.dueDate && (
          <div className="flex items-center text-sm text-muted-foreground ml-4">
            <Calendar size={14} className="mr-1" />
            <span>Due: {scenario.dueDate}</span>
          </div>
        )}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={onEditClick}>
            <Edit3 size={16} className="mr-2" />
            Edit Scenario
          </Button>
          <Button onClick={() => navigate(`/tasks?scenarioId=${scenario.id}`)}>
            <PlayCircle size={16} className="mr-2" />
            Execute Scenario
          </Button>
        </div>
      </div>
    </header>
  );
};

export default ScenarioHeader;
