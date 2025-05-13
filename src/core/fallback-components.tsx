// src/core/fallback-components.tsx
import React from 'react';

export const NotFoundComponent: React.FC<any> = ({ 
  componentType = 'component',
  componentName = 'Unknown', 
  tplDir = 'unknown',
  ...props 
}) => {
  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="text-red-600 font-medium">
        Nie znaleziono komponentu: {componentName}
      </div>
      <div className="text-red-500 text-sm mt-1">
        Typ: {componentType}, Katalog: {tplDir}
      </div>
      {Object.keys(props).length > 0 && (
        <details className="mt-2">
          <summary className="text-sm text-red-500 cursor-pointer">
            Przekazane propsy
          </summary>
          <pre className="mt-2 text-xs bg-red-100 p-2 rounded text-red-800 overflow-auto max-h-40">
            {JSON.stringify(props, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
};

export const NotFoundWidget: React.FC<any> = (props) => (
  <NotFoundComponent componentType="widget" {...props} />
);

export const NotFoundLayout: React.FC<any> = ({ children, ...props }) => (
  <div className="min-h-screen">
    <div className="p-4 bg-red-100 mb-4">
      <NotFoundComponent componentType="layout" {...props} />
    </div>
    <div className="p-4">{children}</div>
  </div>
);