// src/templates/minimal/flowSteps/SummaryStepTemplate.tsx
import React from "react";
import { FlowStepProps } from "../../baseTemplate";
import { useAppStore } from "@/lib/store";

const SummaryStepTemplate: React.FC<FlowStepProps> = ({ node, onSubmit, onPrevious, isLastNode }) => {
  // Pobieranie danych z kontekstu
  const getContextPath = useAppStore((state) => state.getContextPath);
  const processTemplate = useAppStore((state) => state.processTemplate);
  
  // Pobierz dane z formularza
  const financialData = getContextPath("collect-data") || {};
  
  // Pobierz dane z analizy AI
  const reportData = getContextPath("generate-report") || {};

  // Process assistant message with context variables
  const processedMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : '';
  
  return (
    <div>
      <div className="mb-4">
        <h3 className="font-bold text-xl text-gray-900">Podsumowanie analizy biznesowej</h3>
      </div>
      
      {/* Assistant message */}
      {processedMessage && (
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <p className="text-base text-gray-700">{processedMessage}</p>
        </div>
      )}
      
      <div className="space-y-6">
        {/* Dane finansowe */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-blue-50 p-3 border-b border-gray-200">
            <h4 className="font-semibold text-blue-800">Dane wejściowe</h4>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-gray-600">Przychody:</div>
              <div className="font-medium text-gray-900">{financialData.revenue || 0} PLN</div>
              
              <div className="text-gray-600">Koszty:</div>
              <div className="font-medium text-gray-900">{financialData.cost || 0} PLN</div>
              
              <div className="text-gray-600">Zysk:</div>
              <div className="font-medium text-gray-900">
                {financialData.revenue && financialData.cost
                  ? (financialData.revenue - financialData.cost).toLocaleString()
                  : 0} PLN
              </div>
            </div>
          </div>
        </div>
        
        {/* Wyniki analizy */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-green-50 p-3 border-b border-gray-200">
            <h4 className="font-semibold text-green-800">Wyniki analizy</h4>
          </div>
          <div className="p-4">
            <div className="mb-4">
              <div className="text-center">
                <span className="text-sm text-gray-500">Zwrot z inwestycji</span>
                <div className="text-3xl font-bold text-green-600 mt-1">
                  {reportData.roi || "0"}%
                </div>
              </div>
            </div>
            
            <div className="pt-3 border-t border-gray-100">
              <h5 className="font-medium mb-2">Rekomendacje:</h5>
              {reportData.recommendations && reportData.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {reportData.recommendations.map((item: string, idx: number) => (
                    <li key={idx} className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 italic">Brak rekomendacji</p>
              )}
            </div>
          </div>
        </div>
        
        {/* Wykres (przykład wizualizacji) */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="bg-purple-50 p-3 border-b border-gray-200">
            <h4 className="font-semibold text-purple-800">Wizualizacja danych</h4>
          </div>
          <div className="p-4">
            <div className="h-40 flex items-center justify-center bg-gray-50 rounded-lg">
              <div className="flex items-end h-32 space-x-8">
                <div className="flex flex-col items-center">
                  <div 
                    className="w-16 bg-blue-400 rounded-t-md" 
                    style={{height: `${(financialData.revenue / Math.max(financialData.revenue, financialData.cost)) * 120}px`}}
                  ></div>
                  <span className="mt-2 text-sm">Przychody</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-16 bg-red-400 rounded-t-md" 
                    style={{height: `${(financialData.cost / Math.max(financialData.revenue, financialData.cost)) * 120}px`}}
                  ></div>
                  <span className="mt-2 text-sm">Koszty</span>
                </div>
                <div className="flex flex-col items-center">
                  <div 
                    className="w-16 bg-green-400 rounded-t-md" 
                    style={{
                      height: `${Math.max(((financialData.revenue - financialData.cost) / Math.max(financialData.revenue, financialData.cost)) * 120, 0)}px`
                    }}
                  ></div>
                  <span className="mt-2 text-sm">Zysk</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-between pt-4 mt-6">
        <button
          onClick={onPrevious}
          className="px-5 py-3 rounded-md transition-colors text-base font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
        >
          Wstecz
        </button>
        
        <button
          onClick={() => onSubmit({ completed: true })}
          className="px-5 py-3 rounded-md transition-colors text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
        >
          {isLastNode ? "Zakończ" : "Dalej"}
        </button>
      </div>
    </div>
  );
};

export default SummaryStepTemplate;