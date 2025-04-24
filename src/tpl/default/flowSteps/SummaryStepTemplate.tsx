// src/tpl/default/flowSteps/SummaryStepTemplate.tsx
import React, { useEffect, useState } from "react";
import { FlowStepProps } from "@/types";
import { useContextStore } from "@/hooks/useContextStore";
import { useWorkspaceStore } from "@/hooks/useWorkspaceStore";
import { useNavigate, useParams } from "react-router-dom";

// Interfejs dla konfiguracji wyświetlania sekcji podsumowania
interface SummarySection {
  key: string;
  title: string;
  data: any;
  type?: 'list' | 'object' | 'value' | 'metrics' | 'table';
  layout?: 'card' | 'panel' | 'inline';
  icon?: string;
}

const SummaryStepTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode
}) => {
  const [summaryData, setSummaryData] = useState<Record<string, any>>({});
  const [summaryStructure, setSummaryStructure] = useState<Record<string, any>>({});
  const [summarySections, setSummarySections] = useState<SummarySection[]>([]);
  
  const contextStore = useContextStore();
  const currWrkspId = useWorkspaceStore((state) => state.currentWorkspaceId);
  const navigate = useNavigate();
  const { application, workspace } = useParams();

  const contextSchemas = contextStore.contexts && currWrkspId 
    ? contextStore.contexts[currWrkspId]?.schemas?.summary 
    : null;

  const processedAssistantMessage = node.assistantMessage
    ? contextStore.processTemplate 
      ? contextStore.processTemplate(node.assistantMessage)
      : node.assistantMessage
    : "";

  // Load summary schema and prepare sections for rendering
  useEffect(() => {
    if (!contextSchemas || !node.attrs?.schemaPath) {
      console.warn("No schema or schema path found for summary");
      setSummarySections([]);
      return;
    }

    const schemaKey = node.attrs.schemaPath.replace(/^schemas\.summary\./, "");
    const schema = contextSchemas[schemaKey];

    if (!schema) {
      console.warn("No schema found for summary key:", schemaKey);
      return;
    }

    // Zapisz strukturę schematu (bez pól zaczynających się od _)
    const cleanStructure = Object.entries(schema)
      .filter(([key]) => !key.startsWith('_'))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
    
    setSummaryStructure(cleanStructure);

    // Layout information might be in the schema itself
    const schemaLayout = schema._layout || {};
  }, [contextSchemas, node.attrs?.schemaPath]);

  // Load data paths and extract data
  useEffect(() => {
    if (!node.attrs?.dataPaths || !contextStore.contexts || !currWrkspId) {
      return;
    }
    
    const context = contextStore.contexts[currWrkspId];
    const extractedData: Record<string, any> = {};
    
    // First, extract all data from context
    Object.entries(node.attrs.dataPaths).forEach(([key, path]) => {
      if (typeof path === 'string') {
        const pathParts = path.split('.');
        let value = context;
        
        for (const part of pathParts) {
          if (value && typeof value === 'object' && part in value) {
            value = value[part];
          } else {
            value = undefined;
            break;
          }
        }
        
        if (value !== undefined) {
          extractedData[key] = value;
        }
      }
    });
    
    // Save the raw data
    setSummaryData(extractedData);
    
    if (!contextSchemas || !node.attrs?.schemaPath) return;
    
    const schemaKey = node.attrs.schemaPath.replace(/^schemas\.summary\./, "");
    const schema = contextSchemas[schemaKey];
    
    if (!schema) return;
    
    // Layout information for sections
    const schemaLayout = schema._layout || {};
    
    // Then, construct sections based on schema and extracted data
    const processedSections = Object.entries(extractedData).map(([key, data]) => {
      // Find schema label for this key if available
      const schemaLabel = schema[key];
      const displayTitle = typeof schemaLabel === 'string' ? schemaLabel : key;
      
      // Determine the best display type based on the data structure
      let type: 'list' | 'object' | 'value' | 'metrics' | 'table' = 'value';
      
      if (Array.isArray(data)) {
        type = 'list';
      } else if (typeof data === 'object' && data !== null) {
        // Check if this looks like metrics data with numbers
        const hasNumericValues = Object.values(data).some(val => 
          typeof val === 'number' || (typeof val === 'string' && !isNaN(Number(val)))
        );
        
        if (hasNumericValues && Object.keys(data).length <= 6) {
          type = 'metrics';
        } else {
          type = 'object';
        }
      }
      
      // Get layout configuration from schema if available
      const sectionLayout = schemaLayout[key] || {};
      
      return {
        key,
        title: displayTitle,
        data,
        type: sectionLayout.type || type,
        layout: sectionLayout.layout || 'card',
        icon: sectionLayout.icon
      };
    });
    
    setSummarySections(processedSections);
  }, [contextStore.contexts, currWrkspId, node.attrs?.dataPaths, contextSchemas, node.attrs?.schemaPath]);

  // Handle navigation on completion
  const handleCompletion = () => {
    onSubmit(summaryData);
    
    if (isLastNode) {
      if (application && workspace) {
        navigate(`/app/${application}/${workspace}`);
      } else if (workspace) {
        navigate(`/${workspace}`);
      } else {
        navigate('/');
      }
    }
  };

  // Format values for display
  const formatValue = (value: any): string => {
    if (value === null || value === undefined) {
      return 'Brak danych';
    }
    
    if (typeof value === 'object') {
      if (Array.isArray(value)) {
        return value.map(v => typeof v === 'object' ? JSON.stringify(v) : String(v)).join(', ');
      }
      return JSON.stringify(value);
    }
    
    return String(value);
  };

  // Render a section based on its type and layout
  const renderSection = (section: SummarySection) => {
    const { key, title, data, type = 'value', layout = 'card', icon } = section;
    
    // Render content based on type
    const renderContent = () => {
      switch (type) {
        case 'list':
          if (!Array.isArray(data)) return <p className="text-gray-500 italic">Niepoprawne dane listy</p>;
          
          return (
            <ul className="mt-2 space-y-2">
              {data.map((item, idx) => (
                <li key={idx} className="flex items-start">
                  <span className="mr-2 mt-1 h-2 w-2 rounded-full bg-blue-500 flex-shrink-0"></span>
                  <span className="text-gray-700">{
                    typeof item === 'object' ? JSON.stringify(item) : String(item)
                  }</span>
                </li>
              ))}
            </ul>
          );
          
        case 'metrics':
          return (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-3">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-500">{key}</p>
                  <p className="text-lg font-semibold text-gray-900">{formatValue(value)}</p>
                </div>
              ))}
            </div>
          );
          
        case 'object':
          return (
            <div className="mt-2 space-y-3">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <span className="text-sm font-medium text-gray-700">{key}:</span>
                  <span className="ml-4 text-gray-600">
                    {formatValue(value)}
                  </span>
                </div>
              ))}
            </div>
          );
          
        case 'table':
          if (!Array.isArray(data) || data.length === 0) {
            return <p className="text-gray-500 italic">Brak danych</p>;
          }
          
          const headers = Object.keys(data[0]);
          
          return (
            <div className="mt-3 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {headers.map(header => (
                      <th 
                        key={header} 
                        className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data.map((row, idx) => (
                    <tr key={idx}>
                      {headers.map(header => (
                        <td key={`${idx}-${header}`} className="px-3 py-2 text-sm text-gray-500">
                          {formatValue(row[header])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
          
        case 'value':
        default:
          return (
            <div className="mt-1">
              <p className="text-gray-700">{formatValue(data)}</p>
            </div>
          );
      }
    };
    
    // Render the section container based on layout
    switch (layout) {
      case 'card':
        return (
          <div key={key} className="bg-white border rounded-lg shadow-sm p-4">
            <div className="flex items-center">
              {icon && (
                <div className="mr-3 p-2 rounded-full bg-blue-50 text-blue-500">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  >
                    <path d={icon} />
                  </svg>
                </div>
              )}
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            </div>
            <div className="mt-4">
              {renderContent()}
            </div>
          </div>
        );
        
      case 'panel':
        return (
          <div key={key} className="border rounded-lg overflow-hidden mb-4">
            <div className="bg-gray-50 px-4 py-3 border-b">
              <h3 className="text-base font-medium text-gray-900">{title}</h3>
            </div>
            <div className="p-4">
              {renderContent()}
            </div>
          </div>
        );
        
      case 'inline':
      default:
        return (
          <div key={key} className="mb-6">
            <h3 className="text-base font-medium text-gray-700 mb-2">{title}</h3>
            {renderContent()}
          </div>
        );
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Assistant message */}
      {processedAssistantMessage && (
        <div className="bg-blue-50 p-4 rounded-lg mb-6">
          <p className="text-blue-800">{processedAssistantMessage}</p>
        </div>
      )}

      {/* Display summary sections */}
      {summarySections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {summarySections.map(section => renderSection(section))}
        </div>
      ) : (
        <div className="bg-yellow-50 p-4 rounded-lg mb-6">
          <p className="text-yellow-700">Brak danych do wyświetlenia w podsumowaniu.</p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button 
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          Wstecz
        </button>
        
        <button 
          onClick={handleCompletion}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {isLastNode ? 'Zakończ' : 'Dalej'}
        </button>
      </div>
    </div>
  );
};

export default SummaryStepTemplate;