import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { PageDetails } from "./pageTabComp/PageDetails";
import { PageTree } from "./pageTabComp/PageTree";
import { PageTabProps, SelectedItems } from "./pageTabComp/types";

export const PageTab: React.FC<PageTabProps> = ({ config }) => {
  const { workspace, scenario, step } = useParams<{
    workspace?: string;
    scenario?: string;
    step?: string;
  }>();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract configId from current path to ensure we always have a valid ID
  const configId = location.pathname.split("/")[1] || "default";

  // Stan dla zaznaczonych elementów
  const [selectedItems, setSelectedItems] = useState<SelectedItems>({
    workspace: null,
    scenario: null,
    step: undefined,
  });

  // Stan dla rozwijanych elementów drzewa
  const [expandedWorkspace, setExpandedWorkspace] = useState<string | null>(null);
  const [expandedScenario, setExpandedScenario] = useState<string | null>(null);

  // Efekt do aktualizacji zaznaczenia na podstawie URL
  useEffect(() => {
    if (config) {
      const newSelected: SelectedItems = {
        workspace: workspace || null,
        scenario: scenario || null,
        step: step ? parseInt(step, 10) : undefined,
      };
      
      // Automatycznie rozwijamy odpowiednie sekcje
      if (newSelected.workspace) {
        setExpandedWorkspace(newSelected.workspace);
      }
      
      if (newSelected.scenario) {
        setExpandedScenario(newSelected.scenario);
      }
      
      setSelectedItems(newSelected);
    }
  }, [config, workspace, scenario, step]);

  if (!config) {
    return <div className="p-4 text-gray-500">Brak dostępnej konfiguracji.</div>;
  }

  // Obsługa kliknięcia na obszar roboczy
  const handleWorkspaceClick = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const newSelected: SelectedItems = {
      workspace: slug,
      scenario: null,
      step: undefined,
    };
    
    setSelectedItems(newSelected);
    navigate(`/${configId}/${slug}`);
  };

  // Obsługa kliknięcia na scenariusz
  const handleScenarioClick = (
    workspaceSlug: string,
    scenarioSlug: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    
    const newSelected: SelectedItems = {
      workspace: workspaceSlug,
      scenario: scenarioSlug,
      step: undefined,
    };
    
    setSelectedItems(newSelected);
    navigate(`/${configId}/${workspaceSlug}/${scenarioSlug}`);
  };

  // Obsługa kliknięcia na krok
  const handleStepClick = (
    workspaceSlug: string,
    scenarioSlug: string,
    stepIdx: number,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    
    const newSelected: SelectedItems = {
      workspace: workspaceSlug,
      scenario: scenarioSlug,
      step: stepIdx,
    };
    
    setSelectedItems(newSelected);
    navigate(`/${configId}/${workspaceSlug}/${scenarioSlug}/${stepIdx}`);
  };

  // Obsługa rozwijania/zwijania obszaru roboczego
  const handleToggleWorkspace = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedWorkspace(expandedWorkspace === slug ? null : slug);
  };

  // Obsługa rozwijania/zwijania scenariusza
  const handleToggleScenario = (slug: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedScenario(expandedScenario === slug ? null : slug);
  };

  return (
    <div className="grid grid-cols-12 gap-4 p-4">
      <PageTree
        config={config}
        selectedItems={selectedItems}
        expandedWorkspace={expandedWorkspace}
        expandedScenario={expandedScenario}
        onToggleWorkspace={handleToggleWorkspace}
        onToggleScenario={handleToggleScenario}
        onWorkspaceClick={handleWorkspaceClick}
        onScenarioClick={handleScenarioClick}
        onStepClick={handleStepClick}
      />
      
      <PageDetails 
        config={config} 
        selectedItems={selectedItems}
      />
    </div>
  );
};

export default PageTab;