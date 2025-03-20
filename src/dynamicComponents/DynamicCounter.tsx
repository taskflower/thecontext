/* eslint-disable @typescript-eslint/no-explicit-any */
// src/dynamicComponents/DynamicCounter.tsx
import React, { useState } from 'react';

interface DynamicCounterProps {
  data?: {
    initialCount?: number;
    label?: string;
    [key: string]: any;
  };
}

// This component will be loaded dynamically - it's not imported in App.tsx
const DynamicCounter: React.FC<DynamicCounterProps> = ({ data }) => {
  const initialCount = data?.initialCount || 0;
  const label = data?.label || 'Dynamic Counter';
  
  const [count, setCount] = useState(initialCount);
  
  return (
    <div className="p-4 bg-blue-50 rounded-md">
      <h3 className="text-lg font-medium">{label}</h3>
      <p className="mb-3">Count: {count}</p>
      
      <div className="flex gap-3">
        <button 
          onClick={() => setCount(count - 1)} 
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Decrement
        </button>
        
        <button 
          onClick={() => setCount(count + 1)} 
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Increment
        </button>
      </div>
      
      <div className="mt-3">
        <p className="text-sm text-gray-600">This component was loaded dynamically - it's not imported in App.tsx!</p>
      </div>
    </div>
  );
};

// This self-registration will run when the file is loaded
// but we need a way to actually load this file!
if (typeof window !== 'undefined' && window.__DYNAMIC_COMPONENTS__) {
  window.__DYNAMIC_COMPONENTS__.register('DynamicCounter', DynamicCounter);
  console.log('DynamicCounter registered itself');
}

export default DynamicCounter;