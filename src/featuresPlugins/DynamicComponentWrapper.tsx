/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/DynamicComponentWrapper.tsx
import React, { useState, useEffect } from 'react';
import useDynamicComponentStore from './dynamicComponentStore';

interface DynamicComponentWrapperProps {
  componentKey: string;
}

const DynamicComponentWrapper: React.FC<DynamicComponentWrapperProps> = ({ componentKey }) => {
  const [inputData, setInputData] = useState<string>('');
  const [currentData, setCurrentData] = useState<any>(null);
  
  const component = useDynamicComponentStore(state => state.getComponent(componentKey));
  const componentData = useDynamicComponentStore(state => state.getComponentData(componentKey));
  const setComponentData = useDynamicComponentStore(state => state.setComponentData);
  
  useEffect(() => {
    setCurrentData(componentData);
  }, [componentData]);
  
  if (!component) {
    return <div>Component not found: {componentKey}</div>;
  }
  
  const Component = component;
  
  const handleSendData = () => {
    try {
      const parsedData = inputData.trim() ? JSON.parse(inputData) : null;
      setComponentData(componentKey, parsedData);
    } catch (e) {
      alert(`Invalid JSON format: ${(e as Error).message}`);
    }
  };
  
  return (
    <div className="border border-gray-300 p-4 my-3 rounded-md">
      <h3 className="text-lg font-medium">Component: {componentKey}</h3>
      
      <div className="my-4 p-3 bg-gray-100">
        <Component data={componentData} />
      </div>
      
      <div className="flex flex-col gap-3">
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="Enter JSON data to send to component"
          className="w-full h-24 p-2 border border-gray-300 rounded-md"
        />
        
        <button 
          onClick={handleSendData}
          className="px-4 py-2 bg-blue-500 text-white border-none rounded-md cursor-pointer hover:bg-blue-600"
        >
          Send Data to Component
        </button>
        
        <div>
          <h4 className="font-medium mb-2">Current Component Data:</h4>
          <textarea
            value={currentData ? JSON.stringify(currentData, null, 2) : ''}
            readOnly
            className="w-full h-24 p-2 bg-gray-50 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

export default DynamicComponentWrapper;