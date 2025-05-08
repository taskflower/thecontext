// src/core/engine.tsx
import React, { Suspense, lazy, useMemo } from "react";
import { z, ZodTypeAny } from "zod";
import { useFlowStore } from "./context";
import { AppConfig, NodeConfig } from "./types";
import { useNavigate, useParams } from "react-router-dom";

function jsonToZod(schema: any): ZodTypeAny {
  if (!schema) return z.any();
  switch (schema.type) {
    case "string":
      return z.string();
    case "number":
      return z.number();
    case "boolean":
      return z.boolean();
    case "array":
      return z.array(schema.items ? jsonToZod(schema.items) : z.any());
    case "object": {
      const props: Record<string, ZodTypeAny> = {};
      for (const key in schema.properties || {}) {
        props[key] = jsonToZod(schema.properties[key]);
      }
      let obj = z.object(props);
      if (schema.required) {
        obj = obj.extend(
          schema.required.reduce((acc: any, key: string) => {
            acc[key] = props[key];
            return acc;
          }, {})
        );
      }
      return obj;
    }
    default:
      return z.any();
  }
}

const NodeRenderer: React.FC<{
  config: AppConfig;
  node: NodeConfig;
  onNext: () => void;
}> = ({ config, node, onNext }) => {
  const { get, set } = useFlowStore();
  const jsonSchema = useMemo(
    () =>
      config.workspaces[0]?.contextSchema.properties?.[
        node.contextSchemaPath
      ] || {},
    [config.workspaces, node.contextSchemaPath]
  );
  const schema = useMemo(() => jsonToZod(jsonSchema), [jsonSchema]);
  const data = get(node.contextDataPath);
  const Component = lazy(() =>
    import(`../themes/${config.tplDir}/components/${node.tplFile}`).catch(
      () => import("../themes/default/components/ErrorStep")
    )
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
  };

  // Zmodyfikowana funkcja onSubmit - bez zmian
  const handleSubmit = (val: any) => {
    if (val !== null) {
      set(node.contextDataPath, val);
    }
    onNext();
  };

  return (
    <Suspense fallback={<div>Ładowanie kroku...</div>}>
      <Component
        schema={schema}
        jsonSchema={jsonSchema}
        data={data}
        onSubmit={handleSubmit}
        {...attrs}
      />
    </Suspense>
  );
};

// Główny silnik aplikacji sterowany URL-em
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

  const handleNext = () => {
    if (index < nodes.length - 1) {
      navigate(`/${workspaceSlug}/${scenarioSlug}/${index + 1}`);
    } else {
      navigate(`/${workspaceSlug}`);
    }
  };

  return <NodeRenderer config={config} node={node} onNext={handleNext} />;
};
