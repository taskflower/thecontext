import React, { Suspense, lazy, useMemo } from 'react';
import { z, ZodTypeAny } from 'zod';
import { useFlowStore } from './context';
import { AppConfig, NodeConfig } from './types';

// Deklaracja typów dla window
declare global {
  interface Window {
    _loggedSchemas?: Record<string, boolean>;
  }
}

// Konwerter JSON Schema -> Zod
function jsonToZod(schema: any): ZodTypeAny {
  if (!schema) return z.any();
  
  switch (schema.type) {
    case 'string': return z.string();
    case 'number': return z.number();
    case 'boolean': return z.boolean();
    case 'array': return z.array(schema.items ? jsonToZod(schema.items) : z.any());
    case 'object': {
      const props: Record<string, ZodTypeAny> = {};
      for (const key in schema.properties || {}) {
        props[key] = jsonToZod(schema.properties[key]);
      }
      
      let obj = z.object(props);
      if (schema.required?.length) {
        const required = schema.required.reduce((acc: any, key: string) => {
          acc[key] = props[key];
          return acc;
        }, {});
        obj = obj.extend(required);
      }
      return obj;
    }
    default: return z.any();
  }
}

// Component do renderowania pojedynczego kroku
const NodeRenderer: React.FC<{
  config: AppConfig;
  node: NodeConfig;
  onNext: () => void;
}> = ({ config, node, onNext }) => {
  const { get, set } = useFlowStore();
  
  // Uproszczone podejście - bezpośredni dostęp do schematu
  const jsonSchema = useMemo(() => 
    config.workspaces[0]?.contextSchema?.properties?.[node.contextSchemaPath] || {},
  [config.workspaces, node.contextSchemaPath]);
  
  // Zoptymalizowane logowanie - tylko raz dla każdej ścieżki schematu
  if (process.env.NODE_ENV === 'development') {
    // Inicjalizacja obiektu dla śledzenia zalogowanych schematów
    window._loggedSchemas = window._loggedSchemas || {};
    
    // Loguj schemat tylko raz dla danej ścieżki
    if (!window._loggedSchemas[node.contextSchemaPath]) {
      console.log("Schemat JSON dla", node.contextSchemaPath, ":", jsonSchema);
      window._loggedSchemas[node.contextSchemaPath] = true;
    }
  }
  
  const schema = useMemo(() => jsonToZod(jsonSchema), [jsonSchema]);
  const data = get(node.contextDataPath);
  
  // Dynamiczne ładowanie komponentu szablonu
  const Component = lazy(() => 
    import(`../themes/${config.tplDir}/components/${node.tplFile}`)
      .catch(() => import('../themes/default/components/ErrorStep'))
  );
  
  // Obsługa templatów z wartościami z contextu - memoizacja
  const processTemplateString = useMemo(() => {
    return (str: string) => {
      return str.replace(/{{([^}]+)}}/g, (_, path) => {
        const value = get(path.trim());
        return value !== undefined ? String(value) : '';
      });
    };
  }, [get]);
  
  // Przetworzone atrybuty z obsługą templateów - memoizacja
  const processedAttrs = useMemo(() => {
    return Object.entries(node.attrs || {}).reduce((acc, [key, value]) => {
      acc[key] = typeof value === 'string' ? processTemplateString(value) : value;
      return acc;
    }, {} as Record<string, any>);
  }, [node.attrs, processTemplateString]);
  
  const handleSubmit = (val: any) => {
    set(node.contextDataPath, val);
    onNext();
  };
  
  return (
    <Suspense fallback={<div>Ładowanie...</div>}>
      <Component 
        schema={schema}
        jsonSchema={jsonSchema} 
        data={data} 
        onSubmit={handleSubmit}
        {...processedAttrs}
      />
    </Suspense>
  );
};

// Główny silnik aplikacji
export const FlowEngine: React.FC<{ 
  config: AppConfig;
  scenarioSlug?: string;
}> = ({ config, scenarioSlug }) => {
  const { currentNodeIndex, setCurrentNodeIndex } = useFlowStore();
  
  // Wybierz scenariusz (domyślnie pierwszy lub wg sluga)
  const scenario = useMemo(() => 
    scenarioSlug 
      ? config.scenarios.find(s => s.slug === scenarioSlug) 
      : config.scenarios[0],
  [config.scenarios, scenarioSlug]);
    
  if (!scenario) return <div>Scenariusz nie znaleziony</div>;
  
  // Posortowane węzły wg kolejności
  const sortedNodes = useMemo(() => 
    [...scenario.nodes].sort((a, b) => a.order - b.order),
  [scenario.nodes]);
  
  const currentNode = sortedNodes[currentNodeIndex];
  
  if (!currentNode) return <div>Zakończono!</div>;
  
  const handleNext = () => {
    if (currentNodeIndex < sortedNodes.length - 1) {
      setCurrentNodeIndex(currentNodeIndex + 1);
    }
  };
  
  return (
    <NodeRenderer
      config={config}
      node={currentNode}
      onNext={handleNext}
    />
  );
};