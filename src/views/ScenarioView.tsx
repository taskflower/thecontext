// src/views/ScenarioView.tsx
import React, { Suspense, useEffect } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { getLayoutComponent, getWidgetComponent } from "../tpl"; 
import { useWorkspaceStore } from "@/hooks/stateManagment/useWorkspaceStore";
import { Scenario } from "@/types";
import SharedLoader from "@/components/SharedLoader";

export const ScenarioView: React.FC = () => {
  const navigate = useNavigate();
  const { workspace } = useParams();
  const { selectWorkspace, getCurrentWorkspace, isLoading } = useWorkspaceStore();
  
  // Ustawienie aktualnego workspace
  useEffect(() => {
    if (workspace) selectWorkspace(workspace);
  }, [workspace, selectWorkspace]);
  
  const currentWorkspace = getCurrentWorkspace();

  // Pokaż ładowanie lub obsłuż brak workspace
  if (isLoading) return <SharedLoader message="Ładowanie workspace..." fullScreen={true} />;
  if (!currentWorkspace) return <Navigate to="/" replace />;

  // Przygotowanie komponentów
  const LayoutComponent = getLayoutComponent(
    currentWorkspace.templateSettings?.layoutTemplate || "default"
  ) || (() => <div>Layout Not Found</div>);
  
  const WidgetComponent = getWidgetComponent(
    currentWorkspace.templateSettings?.scenarioWidgetTemplate || "card-list"
  ) || getWidgetComponent("card-list") || (() => <div>Widget Not Found</div>);

  // Nawigacja bezpośrednio do scenariusza
  const handleSelectScenario = (scenarioId: string) => 
    navigate(`/${workspace}/${scenarioId}`);

  // Powrót do listy aplikacji
  const handleBack = () => navigate('/');

  // Dane dla widgetu scenariuszy
  const scenarioData = (currentWorkspace.scenarios || []).map((scenario: Scenario) => ({
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    count: scenario.nodes?.length || 0,
    countLabel: "steps",
    icon: scenario.icon || "default-icon",
  }));

  return (
    <Suspense fallback={<SharedLoader message="Ładowanie komponentów..." />}>
      <LayoutComponent title={currentWorkspace.name} onBackClick={handleBack}>
        <WidgetComponent data={scenarioData} onSelect={handleSelectScenario} />
      </LayoutComponent>
    </Suspense>
  );
};

export default ScenarioView;