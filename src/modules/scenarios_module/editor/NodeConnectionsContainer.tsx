// src/modules/scenarios_module/NodeConnectionsContainer.tsx
import React from 'react';
import NodeBuilder from './NodeBuilder';
import ConnectionBuilder from './ConnectionBuilder';

const NodeConnectionsContainer: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <NodeBuilder />
      <ConnectionBuilder />
    </div>
  );
};

export default NodeConnectionsContainer;