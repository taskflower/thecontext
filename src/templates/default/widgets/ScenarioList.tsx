// src/templates/default/widgets/ScenarioList.tsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useFlow, useAppStore } from "@/hooks";
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
  ...props
}) => {
  const navigate = useNavigate();
  const { getCurrentWorkspace } = useAppStore();
  // Używamy hook z AppStore zamiast polegać tylko na hook flow
  const currentWorkspace = workspaceId 
    ? getCurrentWorkspace()  // Jeśli podano workspaceId, użyj go
    : useFlow().currentWorkspace; // W przeciwnym razie użyj currentWorkspace z flow

  // Automatyczne generowanie danych dla scenariuszy z kontekstu
  const scenarioData = useMemo(() => {
    if (!currentWorkspace?.scenarios) {
      return [];
    }

    return currentWorkspace.scenarios.map((scenario) => ({
      id: scenario.id,
      name: scenario.name,
      description: scenario.description || "",
      icon: scenario.icon || "folder",
      count: scenario.nodes?.length || 0,
      countLabel: "kroków",
      // Dodajemy własną funkcję onClick do każdego scenariusza
      onClick: (id: string) => {
        const wsId = workspaceId || currentWorkspace?.id;
        if (wsId) {
          navigate(`/${wsId}/${id}`);
        }
      }
    }));
  }, [currentWorkspace, workspaceId, navigate]);

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
        title={props.title || "Scenariusze"}
        description={props.description}
      />
    </div>
  );
};

export default ScenarioListWidget;