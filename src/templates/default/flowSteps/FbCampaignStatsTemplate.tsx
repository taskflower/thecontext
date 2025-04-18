// src/templates/default/flowSteps/FbCampaignStatsTemplate.tsx
// Template do analizy statystyk kampanii Facebook
import { useState } from "react";
import { FlowStepProps } from "@/views/types";
import { useContextStore } from "@/hooks/useContextStore";

const FbCampaignStatsTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  const [timeframe, setTimeframe] = useState<"today" | "week" | "month">("week");
  
  const processTemplate = useContextStore((state) => state.processTemplate);
  const getContextPath = useContextStore((state) => state.getContextPath);

  // Get campaign data from context
  const fbCampaign = getContextPath("fbCampaign") || {};
  const campaignApiResponse = getContextPath("fbCampaignApi.campaignApiResponse") || {};
  
  // Process the assistant message
  const processedMessage = node.assistantMessage ? processTemplate(node.assistantMessage) : "";

  // Mock statistics data based on selected timeframe
  const getStatsForTimeframe = (timeframe: string) => {
    const baseImpressions = 1000;
    const baseClicks = 50;
    const baseCost = fbCampaign.settings?.budżet || 100;
    
    const multiplier = timeframe === "today" ? 1 : timeframe === "week" ? 7 : 30;
    
    // Add some randomness to make the data look more realistic
    const randomVariance = () => 0.85 + Math.random() * 0.3;
    
    return {
      impressions: Math.round(baseImpressions * multiplier * randomVariance()),
      clicks: Math.round(baseClicks * multiplier * randomVariance()),
      costSpent: Number((baseCost * multiplier * randomVariance()).toFixed(2)),
      ctr: Number(((baseClicks * randomVariance()) / (baseImpressions * randomVariance()) * 100).toFixed(2)),
      costPerClick: Number(((baseCost * randomVariance()) / (baseClicks * randomVariance())).toFixed(2)),
      conversions: Math.round((baseClicks * multiplier * randomVariance()) * 0.1),
      conversionRate: Number((0.1 * randomVariance() * 100).toFixed(2)),
      costPerConversion: Number(((baseCost * multiplier * randomVariance()) / (baseClicks * multiplier * randomVariance() * 0.1)).toFixed(2)),
    };
  };

  const stats = getStatsForTimeframe(timeframe);

  const handleSubmit = () => {
    // Save the stats data and continue
    onSubmit({
      timeframe,
      stats,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Assistant message */}
      {processedMessage && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="whitespace-pre-line">{processedMessage}</p>
        </div>
      )}

      {/* Campaign Info */}
      <div className="bg-white border rounded-lg shadow-sm p-4">
        <h3 className="font-semibold text-lg mb-2">Informacje o kampanii</h3>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          <div>
            <p className="text-sm text-gray-500">ID kampanii</p>
            <p className="font-medium">{campaignApiResponse.id || "Brak danych"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Nazwa</p>
            <p className="font-medium">{campaignApiResponse.name || fbCampaign.content?.tytuł_reklamy || "Brak danych"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Cel</p>
            <p className="font-medium">{fbCampaign.settings?.cel || "Brak danych"}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <p className="font-medium">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Aktywna
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex space-x-2 border-b pb-4">
        <button
          onClick={() => setTimeframe("today")}
          className={`px-4 py-2 rounded-md ${
            timeframe === "today"
              ? "bg-blue-100 text-blue-700 font-medium"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Dzisiaj
        </button>
        <button
          onClick={() => setTimeframe("week")}
          className={`px-4 py-2 rounded-md ${
            timeframe === "week"
              ? "bg-blue-100 text-blue-700 font-medium"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Ostatni tydzień
        </button>
        <button
          onClick={() => setTimeframe("month")}
          className={`px-4 py-2 rounded-md ${
            timeframe === "month"
              ? "bg-blue-100 text-blue-700 font-medium"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Ostatni miesiąc
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm text-gray-500 mb-1">Wyświetlenia</h4>
          <p className="text-2xl font-bold">{stats.impressions.toLocaleString()}</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm text-gray-500 mb-1">Kliknięcia</h4>
          <p className="text-2xl font-bold">{stats.clicks.toLocaleString()}</p>
          <p className="text-sm text-gray-500">CTR: {stats.ctr}%</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm text-gray-500 mb-1">Wydano</h4>
          <p className="text-2xl font-bold">{stats.costSpent.toLocaleString()} PLN</p>
          <p className="text-sm text-gray-500">CPC: {stats.costPerClick} PLN</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm text-gray-500 mb-1">Konwersje</h4>
          <p className="text-2xl font-bold">{stats.conversions.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Współczynnik konwersji: {stats.conversionRate}%</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm text-gray-500 mb-1">Koszt konwersji</h4>
          <p className="text-2xl font-bold">{stats.costPerConversion.toLocaleString()} PLN</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <h4 className="text-sm text-gray-500 mb-1">ROAS (szacowany)</h4>
          <p className="text-2xl font-bold">{(stats.conversions * 3 * 100 / stats.costSpent).toFixed(2)}%</p>
          <p className="text-sm text-gray-500">Przychód: {(stats.conversions * 3 * 100).toLocaleString()} PLN</p>
        </div>
      </div>

      {/* Recommendations Section */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <h3 className="font-semibold text-lg mb-2">Rekomendacje</h3>
        <ul className="space-y-2">
          <li className="flex items-start">
            <span className="text-green-500 mr-2">✓</span>
            <span>
              Kampania osiąga {stats.ctr > 1.5 ? "dobry" : "przeciętny"} CTR ({stats.ctr}%). 
              {stats.ctr < 1.5 ? " Rozważ dopracowanie treści reklamy dla lepszych rezultatów." : ""}
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">i</span>
            <span>
              Koszt konwersji wynosi {stats.costPerConversion} PLN. 
              {stats.costPerConversion > 50 
                ? " To więcej niż średnia dla branży, rozważ optymalizację targetowania." 
                : " To dobry wynik w porównaniu do średniej dla branży."}
            </span>
          </li>
          <li className="flex items-start">
            <span className="text-yellow-500 mr-2">!</span>
            <span>
              Aby zwiększyć zasięg, rozważ zwiększenie dziennego budżetu o 20-30%.
            </span>
          </li>
        </ul>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <button onClick={onPrevious} className="px-4 py-2 bg-gray-200 rounded">
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

export default FbCampaignStatsTemplate;