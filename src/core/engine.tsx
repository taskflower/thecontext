// src/core/engine.tsx (Refactored)
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
  
  // Get schema from workspace configuration
  const jsonSchema = useMemo(
    () => config.workspaces[0]?.contextSchema.properties?.[node.contextSchemaPath] ?? {},
    [config.workspaces, node.contextSchemaPath]
  );
  
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
      {...(node.attrs || {})}
      saveToDB={node.saveToDB}
      scenarioName={currentScenario?.name}
      nodeSlug={node.slug}
      context={{ stepIdx, totalSteps, workspace: null, scenario: null }}
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