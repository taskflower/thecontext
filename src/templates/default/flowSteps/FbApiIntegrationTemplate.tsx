// src/templates/default/flowSteps/FbApiIntegrationTemplate.tsx
// Template do integracji z Facebook Marketing API
import React, { useState, useEffect } from "react";
import { useAppStore } from "@/lib/store";
import { FlowStepProps } from "@/views/types";

// API Status Components
const ApiStatusDisplay: React.FC<{
  status: "idle" | "loading" | "success" | "error";
  message?: string;
}> = ({ status, message }) => {
  const statusClasses = {
    idle: "bg-gray-100 text-gray-600",
    loading: "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    error: "bg-red-100 text-red-600",
  };

  return (
    <div className={`p-3 rounded-md ${statusClasses[status]}`}>
      <div className="flex items-center">
        {status === "loading" && (
          <div className="mr-2 animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        )}
        {status === "success" && (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        )}
        {status === "error" && (
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        )}
        <span>{message || status}</span>
      </div>
    </div>
  );
};

const FbApiIntegrationTemplate: React.FC<FlowStepProps> = ({
  node,
  onSubmit,
  onPrevious,
  isLastNode,
}) => {
  const [apiStatus, setApiStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [accessToken, setAccessToken] = useState<string>("");
  const [adAccountId, setAdAccountId] = useState<string>("");

  const processTemplate = useAppStore((state) => state.processTemplate);
  const getContextPath = useAppStore((state) => state.getContextPath);

  // Get data from previous steps
  const fbCampaign = getContextPath("fbCampaign") || {};
  const webAnalysis = getContextPath("primaryWebAnalysing") || {};

  // Get campaign settings - check both top level and nested settings
  const settings = {
    cel: fbCampaign.cel || fbCampaign.settings?.cel,
    budżet: fbCampaign.budżet || fbCampaign.settings?.budżet,
    czas_trwania: fbCampaign.czas_trwania || fbCampaign.settings?.czas_trwania
  };

  // Get campaign content
  const content = fbCampaign.content || {};

  // Process the assistant message
  const processedMessage = node.assistantMessage
    ? processTemplate(node.assistantMessage)
    : "";

  // Map our campaign objectives to Facebook API values
  const mapCampaignObjective = (objective: string) => {
    const mapping: { [key: string]: string } = {
      "Świadomość marki": "BRAND_AWARENESS",
      "Ruch na stronie": "TRAFFIC",
      "Konwersje": "CONVERSIONS",
      "Instalacje aplikacji": "APP_INSTALLS",
      "Pozyskiwanie leadów": "LEAD_GENERATION",
    };
    return mapping[objective] || "TRAFFIC";
  };

  // Mock function to simulate Facebook API call
  const createFacebookCampaign = async () => {
    if (!accessToken || !adAccountId) {
      setErrorMessage("Wymagane są token dostępu i ID konta reklamowego");
      setApiStatus("error");
      return;
    }

    setApiStatus("loading");
    setErrorMessage("");

    try {
      // Simulate API call with timeout
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // In a real implementation, this would be an actual API call
      // Example of what the API call might look like:
      /*
      const response = await fetch(`https://graph.facebook.com/v19.0/act_${adAccountId}/campaigns`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          name: `Kampania - ${webAnalysis.branża || 'Marketing'}`,
          objective: mapCampaignObjective(settings.cel),
          status: 'PAUSED',
          special_ad_categories: []
        })
      });

      const data = await response.json();
      */

      // Mock successful response
      const mockApiResponse = {
        id: `mockCampaignId_${Date.now()}`,
        name: `Kampania - ${webAnalysis.branża || 'Marketing'}`,
        objective: mapCampaignObjective(settings.cel),
        status: "PAUSED",
        created_time: new Date().toISOString(),
      };

      setApiResponse(mockApiResponse);
      setApiStatus("success");

      // Store the API response in the context
      onSubmit({
        campaignApiResponse: mockApiResponse,
        status: "success",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Facebook API Error:", error);
      setErrorMessage(`Błąd podczas tworzenia kampanii: ${error}`);
      setApiStatus("error");
    }
  };

  return (
    <div className="space-y-6">
      {/* Assistant message */}
      {processedMessage && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="whitespace-pre-line">{processedMessage}</p>
        </div>
      )}

      {/* Campaign Data Summary */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="font-semibold text-lg">Dane kampanii Facebook</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="font-medium">Strona WWW:</p>
              <p className="text-gray-700">{webAnalysis.www || "-"}</p>
            </div>
            <div>
              <p className="font-medium">Branża:</p>
              <p className="text-gray-700">{webAnalysis.branża || "-"}</p>
            </div>
            <div>
              <p className="font-medium">Cel kampanii:</p>
              <p className="text-gray-700">{settings.cel || "-"}</p>
            </div>
            <div>
              <p className="font-medium">Budżet:</p>
              <p className="text-gray-700">
                {settings.budżet || 0} PLN dziennie
              </p>
            </div>
            <div className="col-span-2">
              <p className="font-medium">Tytuł reklamy:</p>
              <p className="text-gray-700">{content.tytuł_reklamy || "-"}</p>
            </div>
            <div className="col-span-2">
              <p className="font-medium">Opis reklamy:</p>
              <p className="text-gray-700">{content.opis_reklamy || "-"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug info - remove in production */}
      <div className="p-3 bg-yellow-50 text-xs text-yellow-800 rounded border border-yellow-200">
        <p className="font-semibold">Debug Info:</p>
        <p>Settings found: cel={settings.cel}, budżet={settings.budżet}, czas_trwania={settings.czas_trwania}</p>
        <p>Content available: {Object.keys(content).length > 0 ? 'Yes' : 'No'}</p>
        <p>Raw fbCampaign: {JSON.stringify({cel: fbCampaign.cel, budżet: fbCampaign.budżet, czas_trwania: fbCampaign.czas_trwania})}</p>
      </div>

      {/* Facebook API Integration Form */}
      <div className="border rounded-lg overflow-hidden shadow-sm">
        <div className="bg-gray-50 p-4 border-b">
          <h3 className="font-semibold text-lg">Integracja z Facebook Marketing API</h3>
          <p className="text-xs text-gray-500 mt-1">
            Dokumentacja: <a 
              href="https://developers.facebook.com/docs/marketing-apis/"
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              Facebook Marketing API
            </a>
          </p>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <label className="block mb-1 font-medium">Facebook Access Token</label>
            <input
              type="text"
              value={accessToken}
              onChange={(e) => setAccessToken(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="EAABsb..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Pobierz token z{" "}
              <a
                href="https://developers.facebook.com/tools/explorer/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Graph API Explorer
              </a>
            </p>
          </div>

          <div>
            <label className="block mb-1 font-medium">ID konta reklamowego</label>
            <input
              type="text"
              value={adAccountId}
              onChange={(e) => setAdAccountId(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="act_1234567890"
            />
            <p className="text-xs text-gray-500 mt-1">
              ID konta reklamowego bez prefiksu 'act_'
            </p>
          </div>

          {apiStatus === "error" && (
            <div className="mt-2">
              <ApiStatusDisplay status="error" message={errorMessage} />
            </div>
          )}

          <button
            onClick={createFacebookCampaign}
            disabled={apiStatus === "loading"}
            className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {apiStatus === "loading" ? "Tworzenie kampanii..." : "Utwórz kampanię na Facebook"}
          </button>
        </div>
      </div>

      {/* API Response */}
      {apiStatus === "loading" && (
        <ApiStatusDisplay status="loading" message="Trwa tworzenie kampanii..." />
      )}

      {apiStatus === "success" && apiResponse && (
        <div className="border rounded-lg overflow-hidden shadow-sm">
          <div className="bg-green-50 p-4 border-b border-green-100">
            <h3 className="font-semibold text-lg text-green-800">
              Kampania utworzona pomyślnie!
            </h3>
          </div>
          <div className="p-4 bg-white">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="font-medium">ID kampanii:</p>
                <p className="text-gray-700">{apiResponse.id}</p>
              </div>
              <div>
                <p className="font-medium">Nazwa kampanii:</p>
                <p className="text-gray-700">{apiResponse.name}</p>
              </div>
              <div>
                <p className="font-medium">Cel:</p>
                <p className="text-gray-700">{apiResponse.objective}</p>
              </div>
              <div>
                <p className="font-medium">Status:</p>
                <p className="text-gray-700">
                  {apiResponse.status === "PAUSED" ? "Wstrzymana" : apiResponse.status}
                </p>
              </div>
              <div>
                <p className="font-medium">Data utworzenia:</p>
                <p className="text-gray-700">
                  {new Date(apiResponse.created_time).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="mt-4 p-3 bg-yellow-50 rounded text-yellow-800 text-sm">
              <p>
                <strong>Uwaga:</strong> Kampania została utworzona w trybie wstrzymanym (PAUSED).
                Aby ją aktywować, przejdź do Menedżera reklam na Facebook.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <button onClick={onPrevious} className="px-4 py-2 bg-gray-200 rounded">
          Wstecz
        </button>

        <button
          onClick={() => onSubmit(apiResponse || {})}
          className="px-4 py-2 bg-blue-500 text-white rounded"
          disabled={apiStatus !== "success" && !isLastNode}
        >
          {isLastNode ? "Zakończ" : "Dalej"}
        </button>
      </div>
    </div>
  );
};

export default FbApiIntegrationTemplate;