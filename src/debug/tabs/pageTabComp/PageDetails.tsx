import React from "react";
import { PageTabConfig, SelectedItems, NodeConfig } from "./types";
import { StepDetails } from "./StepDetails";
import { ScenarioDetails } from "./ScenarioDetails";
import { WorkspaceDetails } from "./WorkspaceDetails";
import { ConfigDetails } from "./ConfigDetails";

interface PageDetailsProps {
  config: PageTabConfig;
  selectedItems: SelectedItems;
}

export const PageDetails: React.FC<PageDetailsProps> = ({ config, selectedItems }) => {
  const workspace = config.workspaces.find(w => w.slug === selectedItems.workspace);
  const scenario = config.scenarios.find(s => s.slug === selectedItems.scenario);
  
  let step: NodeConfig | undefined;
  let stepIndex: number = -1;
  
  if (scenario?.nodes && typeof selectedItems.step === 'number') {
    const sorted = [...scenario.nodes].sort((a, b) => (a.order || 0) - (b.order || 0));
    step = sorted[selectedItems.step];
    stepIndex = selectedItems.step;
  }

  // Determine content based on selection
  let content: React.ReactNode;
  
  if (step !== undefined && stepIndex !== -1) {
    content = <StepDetails step={step} stepIndex={stepIndex} />;
  } else if (scenario) {
    content = <ScenarioDetails scenario={scenario} />;
  } else if (workspace) {
    content = <WorkspaceDetails workspace={workspace} />;
  } else {
    content = <ConfigDetails config={config} />;
  }

  return (
    <div className="col-span-8 bg-white rounded-md shadow-sm">
      {content}
    </div>
  );
};