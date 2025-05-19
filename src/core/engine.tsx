// src/core/engine.tsx (Zmodyfikowany)
import { memo, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  AppConfig,
  NodeConfig,
  useFlowStore,
  TemplateComponentProps,
  useComponent,
  jsonToZod,
} from ".";

import { useAppNavigation } from "./navigation";

interface NodeRendererProps {
  config: AppConfig;
  node: NodeConfig;
  onNext: () => void;
  stepIdx: number;
  totalSteps: number;
}

const NodeRenderer = memo(({
  config,
  node,
  onNext,
  stepIdx,
  totalSteps,
}: NodeRendererProps) => {
  const { get, set } = useFlowStore();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  
  // Znajdź aktualny workspace
  const currentWorkspace = useMemo(
    () => config.workspaces.find(ws => ws.slug === workspaceSlug),
    [config.workspaces, workspaceSlug]
  );
  
  // Get schema from workspace configuration
  const jsonSchema = useMemo(() => {
    if (!currentWorkspace || !node.contextSchemaPath) return {};
    return currentWorkspace.contextSchema.properties[node.contextSchemaPath] || {};
  }, [currentWorkspace, node.contextSchemaPath]);
  
  const zodSchema = useMemo(() => jsonToZod(jsonSchema), [jsonSchema]);
  const data = get(node.contextDataPath);
  const Component = useComponent<TemplateComponentProps>(config.tplDir, node.tplFile);
  
  // Find current scenario
  const currentScenario = useMemo(
    () => config.scenarios.find(s => s.nodes.some(n => n.slug === node.slug)),
    [config.scenarios, node.slug]
  );

  // Handle form submission
  const handleSubmit = (val: any) => {
    if (val !== null) set(node.contextDataPath, val);
    onNext();
  };

  return (
    <Component
      schema={zodSchema}
      jsonSchema={jsonSchema}
      data={data}
      onSubmit={handleSubmit}
      contextSchemaPath={node.contextSchemaPath} // Przekazujemy ścieżkę do schematu
      {...(node.attrs || {})}
      saveToDB={node.saveToDB}
      scenarioName={currentScenario?.name}
      nodeSlug={node.slug}
      context={{ 
        stepIdx, 
        totalSteps, 
        workspace: currentWorkspace || null, 
        scenario: currentScenario || null 
      }}
    />
  );
});

export const FlowEngine = memo(({ 
  config, 
  scenarioSlug, 
  stepIdx 
}: { 
  config: AppConfig; 
  scenarioSlug: string; 
  stepIdx: number; 
}) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { toScenarioStep, toScenarioList } = useAppNavigation();

  // Find and validate scenario
  const scenario = config.scenarios.find(s => s.slug === scenarioSlug);
  if (!scenario) return <div>Scenariusz nie znaleziony</div>;
  
  // Sort nodes by order
  const nodes = useMemo(() => 
    [...scenario.nodes].sort((a, b) => a.order - b.order),
    [scenario.nodes]
  );
  
  // Validate step index
  const index = Math.min(Math.max(stepIdx, 0), nodes.length - 1);
  
  // Handle navigation to next step
  const handleNext = () => {
    if (index < nodes.length - 1)
      toScenarioStep(workspaceSlug!, scenarioSlug, index + 1);
    else 
      toScenarioList(workspaceSlug!);
  };

  return (
    <NodeRenderer
      config={config}
      node={nodes[index]}
      onNext={handleNext}
      stepIdx={index}
      totalSteps={nodes.length}
    />
  );
});