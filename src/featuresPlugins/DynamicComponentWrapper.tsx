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
    <div className="component-wrapper" style={{ border: '1px solid #ccc', padding: '15px', margin: '10px 0', borderRadius: '4px' }}>
      <h3>Component: {componentKey}</h3>
      
      <div className="component-container" style={{ margin: '15px 0', padding: '10px', backgroundColor: '#f5f5f5' }}>
        <Component data={componentData} />
      </div>
      
      <div className="component-controls" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <textarea
          value={inputData}
          onChange={(e) => setInputData(e.target.value)}
          placeholder="Enter JSON data to send to component"
          style={{ width: '100%', height: '100px', padding: '8px' }}
        />
        
        <button 
          onClick={handleSendData}
          style={{ padding: '8px 16px', backgroundColor: '#4f8fef', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
        >
          Send Data to Component
        </button>
        
        <div className="component-data-display">
          <h4>Current Component Data:</h4>
          <textarea
            value={currentData ? JSON.stringify(currentData, null, 2) : ''}
            readOnly
            style={{ width: '100%', height: '100px', padding: '8px', backgroundColor: '#f9f9f9' }}
          />
        </div>
      </div>
    </div>
  );
};

export default DynamicComponentWrapper;