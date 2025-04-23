// src/templates/default/flowSteps/FbCampaignPreviewTemplate.tsx
import React, { useEffect, useState } from "react";
import { FlowStepProps } from "@/views/types";
import { useContextStore } from "@/hooks/useContextStore";

const FbCampaignPreviewTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  const processTemplate = useContextStore((state) => state.processTemplate);
  const getContextPath = useContextStore((state) => state.getContextPath);
  const getContext = useContextStore((state) => state.getContext);
  const [debugInfo, setDebugInfo] = useState<any>({});
  const processedMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : '';

  useEffect(() => {
    const fullContext = getContext();
    setDebugInfo({
      fullContext: JSON.stringify({
        campaign: fullContext.campaign,
        fbCampaign: fullContext.fbCampaign,
        web: fullContext.web,
        primaryWebAnalysing: fullContext.primaryWebAnalysing
      }, null, 2)
    });
  }, [getContext]);

  // Get campaign data from context - sprawdź obie możliwe lokalizacje
  const campaign = getContextPath("campaign") || {};
  const fbCampaign = getContextPath("fbCampaign") || {};
  
  // Połącz dane z obu możliwych źródeł, preferując dane z campaign (nowszy format)
  const campaignData = {
    ...fbCampaign,
    ...campaign,
    settings: {
      ...(fbCampaign.settings || {}),
      ...(campaign.settings || {}),
      // Jeśli dane są na górnym poziomie w campaign, użyj ich
      cel: campaign.goal || fbCampaign.cel || fbCampaign.settings?.cel,
      budżet: campaign.budget || fbCampaign.budżet || fbCampaign.settings?.budżet,
      czas_trwania: campaign.duration || fbCampaign.czas_trwania || fbCampaign.settings?.czas_trwania
    },
    content: {
      ...(fbCampaign.content || {}),
      ...(campaign.content || {}),
      // Mapowanie między formatami
      tytuł_reklamy: (campaign.content?.ad_title || fbCampaign.content?.tytuł_reklamy),
      opis_reklamy: (campaign.content?.ad_text || fbCampaign.content?.opis_reklamy),
      call_to_action: (campaign.content?.call_to_action || fbCampaign.content?.call_to_action),
      sugestie_graficzne: (campaign.content?.visual_suggestions || fbCampaign.content?.sugestie_graficzne),
      grupa_docelowa: {
        ...(fbCampaign.content?.grupa_docelowa || {}),
        ...(campaign.content?.target_audience || {}),
        płeć: campaign.content?.target_audience?.gender || fbCampaign.content?.grupa_docelowa?.płeć,
        wiek_od: campaign.content?.target_audience?.age_from || fbCampaign.content?.grupa_docelowa?.wiek_od,
        wiek_do: campaign.content?.target_audience?.age_to || fbCampaign.content?.grupa_docelowa?.wiek_do,
        zainteresowania: campaign.content?.target_audience?.interests || fbCampaign.content?.grupa_docelowa?.zainteresowania || []
      }
    }
  };
  
  // Get web analysis data - sprawdź obie możliwe lokalizacje
  const web = getContextPath("web") || {};
  const primaryWebAnalysing = getContextPath("primaryWebAnalysing") || {};
  
  // Połącz dane analizy web
  const webData = {
    url: web.url || primaryWebAnalysing.www,
    analysis: {
      ...(web.analysis || {}),
      industry: web.analysis?.industry || primaryWebAnalysing.branża,
      target_audience: web.analysis?.target_audience || primaryWebAnalysing.grupa_docelowa
    }
  };

  // Extract the data we need for display
  const settings = campaignData.settings;
  const content = campaignData.content;

  const handleSubmit = () => {
    // Przy wysyłaniu danych do następnego kroku, złącz dane w jeden spójny format
    // i wyślij do obu ścieżek kontekstu dla kompatybilności
    const combinedData = {
      // Nowy format (campaign)
      goal: settings.cel,
      budget: settings.budżet,
      duration: settings.czas_trwania,
      content: {
        ad_title: content.tytuł_reklamy,
        ad_text: content.opis_reklamy,
        call_to_action: content.call_to_action,
        visual_suggestions: content.sugestie_graficzne,
        target_audience: {
          gender: content.grupa_docelowa?.płeć,
          age_from: content.grupa_docelowa?.wiek_od,
          age_to: content.grupa_docelowa?.wiek_do,
          interests: content.grupa_docelowa?.zainteresowania
        }
      },
      
      // Stary format (fbCampaign) dla kompatybilności wstecznej
      cel: settings.cel,
      budżet: settings.budżet,
      czas_trwania: settings.czas_trwania,
      settings: {
        cel: settings.cel,
        budżet: settings.budżet,
        czas_trwania: settings.czas_trwania
      },
      content: {
        tytuł_reklamy: content.tytuł_reklamy,
        opis_reklamy: content.opis_reklamy,
        call_to_action: content.call_to_action,
        sugestie_graficzne: content.sugestie_graficzne,
        grupa_docelowa: {
          płeć: content.grupa_docelowa?.płeć,
          wiek_od: content.grupa_docelowa?.wiek_od,
          wiek_do: content.grupa_docelowa?.wiek_do,
          zainteresowania: content.grupa_docelowa?.zainteresowania
        }
      }
    };
    
    onSubmit(combinedData);
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
          <div className="font-medium">{webData.url || '-'}</div>
          
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

      {/* Debug information - można zostawić w wersji deweloperskiej */}
      <div className="p-3 bg-yellow-50 text-xs text-yellow-800 rounded border border-yellow-200">
        <p className="font-semibold">Debug Info:</p>
        <p>Context path: {node.contextPath}</p>
        <p>settings.cel: {settings.cel}</p>
        <p>settings.budżet: {settings.budżet}</p>
        <p>settings.czas_trwania: {settings.czas_trwania}</p>
        <p>content.tytuł_reklamy: {content.tytuł_reklamy}</p>
        <p>content.opis_reklamy: {content.opis_reklamy}</p>
        <p>content available: {Object.keys(content).length > 0 ? 'Yes' : 'No'}</p>
        <details>
          <summary>Pełny kontekst (kliknij, aby rozwinąć)</summary>
          <pre className="whitespace-pre-wrap overflow-auto max-h-40 mt-2">
            {debugInfo.fullContext}
          </pre>
        </details>
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