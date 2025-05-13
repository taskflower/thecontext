// src/core/engine.tsx
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

// Komponent NodeRenderer zoptymalizowany z memo
const NodeRenderer: React.FC<NodeRendererProps> = memo(({
  config,
  node,
  onNext,
  stepIdx,
  totalSteps,
}) => {
  const { get, set } = useFlowStore();
  
  // Memoizacja schematów JSON i Zod
  const jsonSchema = useMemo(
    () =>
      config.workspaces[0]?.contextSchema.properties?.[
        node.contextSchemaPath
      ] ?? {},
    [config.workspaces, node.contextSchemaPath]
  );
  
  const zodSchema = useMemo(() => jsonToZod(jsonSchema), [jsonSchema]);
  const data = get(node.contextDataPath);

  // Pobieranie komponentu szablonu
  const Component = useComponent<TemplateComponentProps>(
    config.tplDir,
    node.tplFile
  );

  // Memoizacja znalezionego scenariusza
  const currentScenario = useMemo(
    () =>
      config.scenarios.find((s) =>
        s.nodes.some((n) => n.slug === node.slug)
      ),
    [config.scenarios, node.slug]
  );

  // Memoizacja handlera przesyłania
  const handleSubmit = useMemo(() => (val: any) => {
    if (val !== null) set(node.contextDataPath, val);
    onNext();
  }, [node.contextDataPath, set, onNext]);

  // Memoizacja właściwości komponentu
  const componentProps = useMemo<TemplateComponentProps>(() => ({
    schema: zodSchema,
    jsonSchema,
    data,
    onSubmit: handleSubmit,
    ...(node.attrs || {}),
    saveToDB: node.saveToDB,
    scenarioName: currentScenario?.name,
    nodeSlug: node.slug,
    context: { stepIdx, totalSteps, workspace: null, scenario: null },
  }), [zodSchema, jsonSchema, data, handleSubmit, node, currentScenario, stepIdx, totalSteps]);

  return <Component {...componentProps} />;
});

// Komponent FlowEngine zoptymalizowany z memo
export const FlowEngine: React.FC<{ 
  config: AppConfig; 
  scenarioSlug: string; 
  stepIdx: number; 
}> = memo(({ config, scenarioSlug, stepIdx }) => {
  const { workspaceSlug } = useParams<{ workspaceSlug: string }>();
  const { toScenarioStep, toScenarioList } = useAppNavigation();

  // Memoizacja znalezionego scenariusza
  const scenario = useMemo(() => 
    config.scenarios.find((s) => s.slug === scenarioSlug),
    [config.scenarios, scenarioSlug]
  );
  
  if (!scenario) return <div>Scenariusz nie znaleziony</div>;

  // Memoizacja posortowanych węzłów
  const nodes = useMemo(() => 
    [...scenario.nodes].sort((a, b) => a.order - b.order),
    [scenario.nodes]
  );
  
  const index = Math.min(Math.max(stepIdx, 0), nodes.length - 1);

  // Memoizacja handlera następnego kroku
  const handleNext = useMemo(() => () => {
    if (index < nodes.length - 1)
      toScenarioStep(workspaceSlug!, scenarioSlug, index + 1);
    else toScenarioList(workspaceSlug!);
  }, [index, nodes.length, workspaceSlug, scenarioSlug, toScenarioStep, toScenarioList]);

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