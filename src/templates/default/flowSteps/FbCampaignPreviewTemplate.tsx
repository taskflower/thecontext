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
  const getContextPath = useAppStore((state) => state.getContextPath);

  // Process assistant message with context variables
  const processedMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : '';

  // Get campaign data from context
  // We need to get the full fbCampaign object with all its properties
  const fbCampaign = getContextPath("fbCampaign") || {};
  
  // Get content from fbCampaign.content
  const content = fbCampaign.content || {};
  
  // In this case, settings might be either in fbCampaign.settings or at the top level of fbCampaign
  // We'll check both locations
  const settings = {
    cel: fbCampaign.cel || fbCampaign.settings?.cel,
    budżet: fbCampaign.budżet || fbCampaign.settings?.budżet,
    czas_trwania: fbCampaign.czas_trwania || fbCampaign.settings?.czas_trwania
  };
  
  // Get web analysis data
  const webAnalysis = getContextPath("primaryWebAnalysing") || {};

  const handleSubmit = () => {
    // Send complete campaign data to next step
    onSubmit(fbCampaign);
  };

  return (
    <div className="space-y-6">
      {/* Assistant message */}
      {processedMessage && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="whitespace-pre-line">{processedMessage}</p>
        </div>
      )}

      {/* Facebook Ad Preview */}
      <div className="border rounded-lg overflow-hidden shadow-md">
        {/* Header */}
        <div className="bg-blue-600 p-3 flex items-center">
          <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-blue-600 font-bold mr-2">
            f
          </div>
          <div className="text-white">
            <p className="font-semibold">Facebook Ad Preview</p>
            <p className="text-xs opacity-75">Sponsored</p>
          </div>
        </div>

        {/* Ad content */}
        <div className="p-4 bg-white">
          {content && (
            <>
              <h3 className="font-bold text-lg mb-2">{content.tytuł_reklamy || 'Ad Title'}</h3>
              <p className="text-gray-700 mb-4">{content.opis_reklamy || 'Ad description will appear here.'}</p>
              
              <div className="h-40 bg-gray-200 flex items-center justify-center mb-4 rounded">
                <p className="text-gray-500">{content.sugestie_graficzne || 'Creative suggestion placeholder'}</p>
              </div>
              
              <button className="bg-blue-600 text-white px-4 py-2 rounded w-full">
                {content.call_to_action || 'Learn More'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Campaign settings summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Ustawienia kampanii:</h3>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>Strona WWW:</div>
          <div className="font-medium">{webAnalysis.www || '-'}</div>
          
          <div>Cel kampanii:</div>
          <div className="font-medium">{settings.cel || '-'}</div>
          
          <div>Budżet:</div>
          <div className="font-medium">{settings.budżet || 0} PLN</div>
          
          <div>Czas trwania:</div>
          <div className="font-medium">{settings.czas_trwania || 0} dni</div>
          
          <div>Grupa docelowa:</div>
          <div className="font-medium">
            {content.grupa_docelowa ? (
              <>
                {content.grupa_docelowa.płeć || '-'}, 
                {content.grupa_docelowa.wiek_od || '-'}-{content.grupa_docelowa.wiek_do || '-'} lat
              </>
            ) : '-'}
          </div>
          
          <div>Zainteresowania:</div>
          <div className="font-medium">
            {content.grupa_docelowa?.zainteresowania?.join(", ") || '-'}
          </div>
        </div>
      </div>

      {/* Debug information - can be removed in production */}
      <div className="p-3 bg-yellow-50 text-xs text-yellow-800 rounded border border-yellow-200">
        <p className="font-semibold">Debug Info:</p>
        <p>Context path: {node.contextPath}</p>
        <p>Settings found: cel={settings.cel}, budżet={settings.budżet}, czas_trwania={settings.czas_trwania}</p>
        <p>Content available: {Object.keys(content).length > 0 ? 'Yes' : 'No'}</p>
        <p>Raw fbCampaign: {JSON.stringify({cel: fbCampaign.cel, budżet: fbCampaign.budżet, czas_trwania: fbCampaign.czas_trwania})}</p>
      </div>

      {/* Navigation buttons */}
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