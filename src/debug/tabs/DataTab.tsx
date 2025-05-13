// src/debug/tabs/DataTab.tsx
import React, { useState } from 'react';
import JsonTreeRenderer from '../components/JsonTreeRenderer';

interface DataTabProps {
  contextData: Record<string, any>;
}

const DataTab: React.FC<DataTabProps> = ({ contextData }) => {
  const [expandedPaths, setExpandedPaths] = useState<Record<string, boolean>>({});

  return (
    <div className="p-4 h-full overflow-auto">
      <div className="rounded-md border border-gray-200 p-3 bg-gray-50 h-full overflow-auto">
        {Object.keys(contextData).length > 0 ? (
          <JsonTreeRenderer
            data={contextData}
            expandedPaths={expandedPaths}
            setExpandedPaths={setExpandedPaths}
          />
        ) : (
          <div className="text-gray-500 italic text-center p-4">Kontekst jest pusty</div>
        )}
      </div>
    </div>
  );
};

export default DataTab;