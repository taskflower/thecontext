// src/debug/tabs/SchemaTab.tsx
import React from 'react';
import { AppConfig } from '../../core/types';
import JsonSchemaRenderer, { JsonSchema } from '../components/JsonSchemaRenderer';

interface SchemaTabProps {
  contextData: Record<string, any>;
  config?: AppConfig;
}

const SchemaTab: React.FC<SchemaTabProps> = ({ contextData, config }) => {
  if (!config) {
    return (
      <div className="p-4 text-gray-500 italic text-center">
        Brak konfiguracji
      </div>
    );
  }

  const workspace = config.workspaces[0];
  const rootSchema = workspace?.contextSchema as JsonSchema;

  if (!rootSchema) {
    return (
      <div className="p-4 text-gray-500 italic text-center">
        Brak schemy
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto bg-white">
      <h2 className="text-xl font-semibold mb-4">Schema Workspace</h2>
      {/* Renderujemy schemę wraz z danymi: */}
      <JsonSchemaRenderer
        schema={rootSchema}
        rootName={workspace.name || 'root'}
        contextData={contextData}
      />
    </div>
  );
};

export default SchemaTab;
