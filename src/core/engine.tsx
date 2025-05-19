// src/core/engine.tsx (Z dodatkowym debugowaniem)
import { memo, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  AppConfig,
  NodeConfig,
  useFlowStore,
  TemplateComponentProps,
  useComponent,
  jsonToZod,
  getPath,
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
  
  // Dodajemy debugowanie
  console.log("NodeRenderer Config:", {
    node: node.slug,
    contextSchemaPath: node.contextSchemaPath,
    contextDataPath: node.contextDataPath,
    workspaceSlug,
    currentWorkspace: currentWorkspace ? currentWorkspace.slug : null
  });
  
  if (currentWorkspace) {
    console.log("Workspace contextSchema:", currentWorkspace.contextSchema);
  }
  
  // Get schema from workspace configuration - pozwala na głęboki dostęp do schematu
  const jsonSchema = useMemo(() => {
    if (!currentWorkspace || !node.contextSchemaPath) {
      console.warn("Missing workspace or contextSchemaPath");
      return {};
    }
    
    // Podziel ścieżkę na segmenty, pierwszy segment jest głównym obiektem w properties
    const pathSegments = node.contextSchemaPath.split('.');
    const rootProperty = pathSegments[0];
    
    console.log("Path segments:", pathSegments);
    console.log("Root property:", rootProperty);
    
    // Pobierz główny obiekt ze schematu
    const rootSchema = currentWorkspace.contextSchema.properties[rootProperty];
    if (!rootSchema) {
      console.warn(`Root schema not found for property: ${rootProperty}`);
      console.log("Available properties:", Object.keys(currentWorkspace.contextSchema.properties));
      return {};
    }
    
    console.log("Root schema:", rootSchema);
    
    // Jeśli nie ma dalszych segmentów, zwróć cały obiekt
    if (pathSegments.length === 1) {
      console.log("Returning root schema (no segments)");
      return rootSchema;
    }
    
    // W przeciwnym razie nawiguj głębiej w schemat
    // Dodajemy bardziej szczegółowe śledzenie
    let currentLevel = rootSchema;
    let path = '';
    
    for (let i = 1; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      path = path ? `${path}.${segment}` : segment;
      
      console.log(`Looking for segment "${segment}" at path "${path}"`);
      
      if (currentLevel.type === 'object' && currentLevel.properties && currentLevel.properties[segment]) {
        currentLevel = currentLevel.properties[segment];
        console.log(`Found segment "${segment}":`, currentLevel);
      } else {
        console.warn(`Segment "${segment}" not found in schema at path "${path}"`);
        console.log("Current level:", currentLevel);
        return {};
      }
    }
    
    console.log("Final schema:", currentLevel);
    return currentLevel;
    
  }, [currentWorkspace, node.contextSchemaPath]);
  
  console.log("Final jsonSchema:", jsonSchema);
  
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
      contextSchemaPath={node.contextSchemaPath}
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