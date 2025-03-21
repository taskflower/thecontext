/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Handle, Position } from 'reactflow';

const CustomNode: React.FC<{ data: any }> = ({ data }) => {
  return (
    <div className="bg-white border border-gray-300 rounded p-6 shadow">
      <Handle type="target" position={Position.Top} className="bg-blue-500" />
      <div className="text-sm font-medium text-gray-700">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="bg-blue-500" />
    </div>
  );
};

export default CustomNode;
