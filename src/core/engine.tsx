// src/core/engine.tsx
import React, { useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  AppConfig,
  NodeConfig,
  useFlowStore,
  TemplateComponentProps,
  useComponent,
} from ".";
import { jsonToZod } from "./utils/jsonToZod";
import { useAppNavigation } from "./navigation";

interface NodeRendererProps {
  config: AppConfig;
  node: NodeConfig;
  onNext: () => void;
  stepIdx: number;
  totalSteps: number;
}

const NodeRenderer: React.FC<NodeRendererProps> = ({
  config,
  node,
  onNext,
  stepIdx,
  totalSteps,
}) => {
  const { get, set } = useFlowStore();
  const jsonSchema = useMemo(
    () =>
      config.workspaces[0]?.contextSchema.properties?.[
        node.contextSchemaPath
      ] ?? {},
    [config.workspaces, node.contextSchemaPath]
  );
  const zodSchema = useMemo(() => jsonToZod(jsonSchema), [jsonSchema]);
  const data = get(node.contextDataPath);

  const Component = useComponent<TemplateComponentProps>(
    config.tplDir,
    node.tplFile
  );

  const currentScenario = useMemo(
    () =>
      config.scenarios.find((s) =>
        s.nodes.some((n) => n.slug === node.slug)
      ),
    [config.scenarios, node.slug]
  );

  const handleSubmit = (val: any) => {
    if (val !== null) set(node.contextDataPath, val);
    onNext();
  };

  const componentProps: TemplateComponentProps = {
    schema: zodSchema,
    jsonSchema,
    data,
    onSubmit: handleSubmit,
    ...(node.attrs || {}),
    saveToDB: node.saveToDB,
    scenarioName: currentScenario?.name,
    nodeSlug: node.slug,
    context: { stepIdx, totalSteps, workspace: null, scenario: null },
  };

  return <Component {...componentProps} />;
};

export const FlowEngine: React.FC<{
  config: AppConfig;
  scenarioSlug: string;
  stepIdx: number;
}> = ({ config, scenarioSlug, stepIdx }) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { toScenarioStep, toScenarioList } = useAppNavigation();

  const scenario = config.scenarios.find((s) => s.slug === scenarioSlug);
  if (!scenario) return <div>Scenariusz nie znaleziony</div>;

  const nodes = [...scenario.nodes].sort((a, b) => a.order - b.order);
  const index = Math.min(Math.max(stepIdx, 0), nodes.length - 1);

  const handleNext = () => {
    if (index < nodes.length - 1)
      toScenarioStep(workspaceSlug!, scenarioSlug, index + 1);
    else toScenarioList(workspaceSlug!);
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
};
