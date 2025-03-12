/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/shared/JsonView.tsx
import React from 'react';

interface JsonViewProps {
  data: Record<string, any>;
}

export const JsonView: React.FC<JsonViewProps> = ({ data }) => {
  return (
    <div className="bg-slate-50 p-4 rounded-md overflow-x-auto">
      <pre className="text-sm font-mono">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
};