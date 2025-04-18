// src/views/ScenarioView.tsx - Updated with enhanced icon support
import React, { Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "../lib/store";
import { getWidgetComponent, getLayoutComponent } from "../lib/templates";


export const ScenarioView: React.FC = () => {
  const navigate = useNavigate();
  const { getCurrentWorkspace } = useAppStore();
  const currentWorkspace = getCurrentWorkspace();

  // Redirect to home if workspace not found
  if (!currentWorkspace) {
    navigate("/");
    return null;
  }

  const { templateSettings, scenarios = [] } = currentWorkspace;

  // Get layout component
  const LayoutComponent = getLayoutComponent(templateSettings.layoutTemplate);
  if (!LayoutComponent) {
    return <div className="p-4">Layout template not found</div>;
  }

  // Get widget component - use the one specified in template settings
  let WidgetComponent = getWidgetComponent(
    templateSettings.scenarioWidgetTemplate
  );
  if (!WidgetComponent) {
    // If widget not found, fallback to default
    WidgetComponent = getWidgetComponent("card-list");
    if (!WidgetComponent) {
      return <div className="p-4">Default widget template not found</div>;
    }
  }

  // Handle scenario selection
  const handleSelectScenario = (scenarioId: string) => {
    navigate(`/${currentWorkspace.id}/${scenarioId}`);
  };

// Przygotuj dane scenariuszy łącznie z ikonami
const scenarioData = scenarios.map((scenario) => {
  console.log("Scenario icon:", scenario.icon); // Dodaj log do debugowania
  return {
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    count: scenario.getSteps?.().length || 0, // Używaj metody getSteps jeśli istnieje
    countLabel: "steps",
    icon: scenario.icon || "default-icon", // Dodaj fallback dla ikony
  };
});

  return (
    <Suspense fallback={<div className="p-4">Loading...</div>}>
      <LayoutComponent>
        <WidgetComponent data={scenarioData} onSelect={handleSelectScenario} />
      </LayoutComponent>
    </Suspense>
  );
};
