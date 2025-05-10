// src/core/engine.tsx
import { Suspense, useMemo } from "react";
import { ZodTypeAny } from "zod";
import { useNavigate, useParams } from "react-router-dom";
import { preloadComponent } from "../preload";
import { AppConfig, NodeConfig, useFlowStore } from ".";
import { jsonToZod } from "./utils/jsonToZod";

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

  const zodSchema: ZodTypeAny = useMemo(
    () => jsonToZod(jsonSchema),
    [jsonSchema]
  );

  const data = get(node.contextDataPath);

  const Component = useMemo(
    () => preloadComponent(config.tplDir, node.tplFile),
    [config.tplDir, node.tplFile]
  );

  const currentScenario = useMemo(
    () =>
      config.scenarios.find((s) => s.nodes.some((n) => n.slug === node.slug)),
    [config.scenarios, node.slug]
  );

  const attrs = {
    ...(node.attrs || {}),
    saveToDB: node.saveToDB,
    scenarioName: currentScenario?.name,
    nodeSlug: node.slug,
    // Przekazujemy kontekst do komponentu
    context: {
      stepIdx,
      totalSteps,
      workspace: config.workspaces.find(w => 
        w.slug === currentScenario?.workspaceSlug
      ),
      scenario: currentScenario
    }
  };

  const handleSubmit = (val: any) => {
    if (val !== null) {
      set(node.contextDataPath, val);
    }
    onNext();
  };

  return (
    <Suspense fallback={<div>Ładowanie kroku...</div>}>
      <Component
        schema={zodSchema}
        jsonSchema={jsonSchema}
        data={data}
        onSubmit={handleSubmit}
        {...attrs}
      />
    </Suspense>
  );
};

export const FlowEngine: React.FC<{
  config: AppConfig;
  scenarioSlug: string;
  stepIdx: number;
}> = ({ config, scenarioSlug, stepIdx }) => {
  const navigate = useNavigate();
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();

  const scenario = useMemo(
    () => config.scenarios.find((s) => s.slug === scenarioSlug),
    [config.scenarios, scenarioSlug]
  );
  if (!scenario) return <div>Scenariusz nie znaleziony</div>;

  const nodes = useMemo(
    () => [...scenario.nodes].sort((a, b) => a.order - b.order),
    [scenario.nodes]
  );
  const index = Math.min(Math.max(stepIdx, 0), nodes.length - 1);
  const node = nodes[index];
  const totalSteps = nodes.length;

  const handleNext = () => {
    if (index < nodes.length - 1) {
      navigate(`/${workspaceSlug}/${scenarioSlug}/${index + 1}`);
    } else {
      navigate(`/${workspaceSlug}`);
    }
  };

  return (
    <NodeRenderer 
      config={config} 
      node={node} 
      onNext={handleNext} 
      stepIdx={index}
      totalSteps={totalSteps}
    />
  );
};