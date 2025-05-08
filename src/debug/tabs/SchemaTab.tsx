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
  const rootSchema: JsonSchema = workspace?.contextSchema;
  if (!rootSchema) {
    return (
      <div className="p-4 text-gray-500 italic text-center">
        Brak schemy
      </div>
    );
  }

  return (
    <div className="p-4 h-full overflow-auto bg-white">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-sm font-semibold">Schema Workspace</h2>
        <div className="text-sm text-gray-500">
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2">String</span>
          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">Number</span>
          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded mr-2">Boolean</span>
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Object/Array</span>
        </div>
      </div>
      <div className="border rounded-md overflow-hidden">
        <JsonSchemaRenderer
          schema={rootSchema}
          rootName={workspace.name || 'root'}
          contextData={contextData}
        />
      </div>
    </div>
  );
};

export default SchemaTab;