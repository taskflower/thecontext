// src/templates/default/flowSteps/FbCampaignPreviewTemplate.tsx
import React from "react";
import { FlowStepProps } from "template-registry-module";
import { useAppStore } from "@/lib/store";

const FbCampaignPreviewTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  const processTemplate = useAppStore((state) => state.processTemplate);

  // Przetwarzamy wiadomość asystenta z kontekstem
  const processedMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : '';

  // Pobieramy dane z kontekstu dla kampanii
  const fbCampaign = useAppStore((state) => {
    const contextPath = node.contextPath || "";
    return state.getContextPath(contextPath) || {};
  });

  // Pobieramy analizę strony
  const webAnalysis = useAppStore((state) => 
    state.getContextPath("primaryWebAnalysing") || {});

  const handleSubmit = () => {
    // Wysyłamy kompletne dane kampanii do następnego kroku
    onSubmit(fbCampaign);
  };

  return (
    <div className="space-y-6">
      {/* Wiadomość asystenta */}
      {processedMessage && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="whitespace-pre-line">{processedMessage}</p>
        </div>
      )}

      {/* Podgląd reklamy Facebook */}
      <div className="border rounded-lg overflow-hidden shadow-md">
        {/* Nagłówek */}
        <div className="bg-blue-600 p-3 flex items-center">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold mr-2">
            f
          </div>
          <div className="text-white">
            <p className="font-semibold">Facebook Ad Preview</p>
            <p className="text-xs opacity-75">Sponsored</p>
          </div>
        </div>

        {/* Treść reklamy */}
        <div className="p-4 bg-white">
          {fbCampaign.content && (
            <>
              <h3 className="font-bold text-lg mb-2">{fbCampaign.content.tytuł_reklamy}</h3>
              <p className="text-gray-700 mb-4">{fbCampaign.content.opis_reklamy}</p>
              
              <div className="h-40 bg-gray-200 flex items-center justify-center mb-4 rounded">
                <p className="text-gray-500">{fbCampaign.content.sugestie_graficzne}</p>
              </div>
              
              <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
                {fbCampaign.content.call_to_action}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Podsumowanie ustawień kampanii */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Ustawienia kampanii:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Strona WWW:</div>
          <div className="font-medium">{webAnalysis.www || '-'}</div>
          
          <div>Cel kampanii:</div>
          <div className="font-medium">{fbCampaign.settings?.cel || '-'}</div>
          
          <div>Budżet:</div>
          <div className="font-medium">{fbCampaign.settings?.budżet || 0} PLN</div>
          
          <div>Czas trwania:</div>
          <div className="font-medium">{fbCampaign.settings?.czas_trwania || 0} dni</div>
          
          <div>Grupa docelowa:</div>
          <div className="font-medium">
            {fbCampaign.content?.grupa_docelowa ? (
              <>
                {fbCampaign.content.grupa_docelowa.płeć}, 
                {fbCampaign.content.grupa_docelowa.wiek_od}-{fbCampaign.content.grupa_docelowa.wiek_do} lat
              </>
            ) : '-'}
          </div>
          
          <div>Zainteresowania:</div>
          <div className="font-medium">
            {fbCampaign.content?.grupa_docelowa?.zainteresowania?.join(", ") || '-'}
          </div>
        </div>
      </div>

      {/* Przyciski nawigacji */}
      <div className="flex justify-between pt-4">
        <button
          onClick={onPrevious}
          className="px-4 py-2 bg-gray-200 rounded"
        >
          Wstecz
        </button>
        
        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {isLastNode ? "Zakończ" : "Dalej"}
        </button>
      </div>
    </div>
  );
};

export default FbCampaignPreviewTemplate;