// src/templates/default/widgets/ScenarioList.tsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFlow } from "@/hooks";
import { CardListWidgetProps } from "../types";
import CardListWidget from "./CardList";

interface ScenarioListWidgetProps extends CardListWidgetProps {
  workspaceId?: string;
}

/**
 * Widget specjalnie do listowania scenariuszy automatycznie na podstawie kontekstu
 */
const ScenarioListWidget: React.FC<ScenarioListWidgetProps> = ({
  workspaceId,
  onSelect,
  ...props
}) => {
  const navigate = useNavigate();
  const { currentWorkspace } = useFlow();

  // Automatyczne generowanie danych dla scenariuszy z kontekstu
  const scenarioData = useMemo(() => {
    if (!currentWorkspace?.scenarios) return [];

    return currentWorkspace.scenarios.map((scenario) => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description || "",
      icon: scenario.icon || "folder",
      count: scenario.nodes?.length || 0,
      countLabel: "kroków",
    }));
  }, [currentWorkspace]);

  // Obsługa wyboru scenariusza
  const handleScenarioSelect = (id: string) => {
    // Użyj workspaceId z props lub z currentWorkspace
    const wsId = workspaceId || currentWorkspace?.id;
    if (wsId) {
      if (onSelect) {
        // Jeśli dostarczono funkcję onSelect, użyj jej
        onSelect(id);
      } else {
        // W przeciwnym razie nawiguj do scenariusza
        navigate(`/${wsId}/${id}`);
      }
    }
  };

  // Widget nie ma danych do wyświetlenia
  if (scenarioData.length === 0) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <p className="text-yellow-700">
          Brak dostępnych scenariuszy w tym workspace.
        </p>
      </div>
    );
  }

  // Używamy CardListWidget do renderowania
  return (
    <div className="space-y-3">
      <CardListWidget
        data={scenarioData}
        onSelect={handleScenarioSelect}
        {...props}
      />
    </div>
  );
};

export default ScenarioListWidget;
