// src/themes/default/components/GoogleAdsCampaignCreator.tsx
import { useState, useEffect } from 'react';
import { useAuth } from '@/auth/useAuth';
import { useFlow } from '@/core/context';
import { ZodType } from 'zod';
import { Check, XCircle, Loader } from 'lucide-react';

interface GoogleAdsCampaignCreatorProps {
  schema: ZodType<any>;
  jsonSchema?: any;
  data?: any;
  onSubmit: (data: any) => void;
  title: string;
  description?: string;
}

export default function GoogleAdsCampaignCreator({
  onSubmit,
  title = "Tworzenie kampanii Google Ads",
  description
}: GoogleAdsCampaignCreatorProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);
  const { getToken } = useAuth();
  const { get } = useFlow();

  // Pobierz dane z kontekstu
  const campaignBasic = get('campaign-basic');
  const adGroup = get('ad-group');
  const adContent = get('ad-content');
  const keywords = get('keywords');
  const campaignReview = get('campaign-review');

  useEffect(() => {
    const createCampaign = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Pobierz token autoryzacyjny
        const token = await getToken();
        if (!token) {
          throw new Error("Brak autoryzacji - zaloguj się ponownie");
        }

        // Przygotuj dane kampanii
        const campaignData = {
          // Dane kampanii
          campaignName: campaignBasic?.campaignName,
          budget: {
            amount_micros: Math.round(campaignBasic?.campaignBudget * 1000000), // Konwersja PLN na mikrojednostki
            delivery_method: 'STANDARD'
          },
          status: campaignBasic?.campaignStatus,
          advertising_channel_type: campaignBasic?.advertisingChannel,
          start_date: campaignBasic?.campaignStartDate?.replace(/-/g, ''),
          end_date: campaignBasic?.campaignEndDate ? campaignBasic.campaignEndDate.replace(/-/g, '') : undefined,
          
          // Dane grupy reklam
          adGroup: {
            name: adGroup?.adGroupName,
            status: adGroup?.adGroupStatus,
            type: adGroup?.adGroupType
          },
          
          // Dane reklamy
          ad: {
            final_urls: [adContent?.finalUrl],
            expanded_text_ad: {
              headline_part1: adContent?.headlinePart1,
              headline_part2: adContent?.headlinePart2,
              description: adContent?.description
            },
            status: 'PAUSED' // Domyślnie ustawiamy jako wstrzymane dla bezpieczeństwa
          },
          
          // Słowa kluczowe
          keywords: keywords?.keywords?.split('\n').filter(Boolean).map((keyword: string) => keyword.trim())
        };

        // Wywołaj endpoint API używając fetch zamiast axios
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/services/googleads/create-campaign`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(campaignData)
          });
          

        // Sprawdź czy status odpowiedzi jest prawidłowy
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Błąd HTTP: ${response.status}`);
        }

        // Przetwórz odpowiedź
        const responseData = await response.json();
        
        // Przygotuj wynik na podstawie odpowiedzi
        const creationResult = {
          success: responseData?.success || false,
          campaignId: responseData?.data?.campaign?.split('/').pop(),
          adGroupId: responseData?.data?.adGroup?.split('/').pop(),
          adId: responseData?.data?.ad?.split('/').pop(),
          keywords: responseData?.data?.keywords,
          notes: campaignReview?.reviewNotes || ""
        };
        
        setResult(creationResult);
        
        // Przekaż wynik do następnego kroku
        onSubmit(creationResult);
      } catch (err: any) {
        console.error("Błąd podczas tworzenia kampanii:", err);
        
        // Przygotuj informacje o błędzie
        const errorResult = {
          success: false,
          errorMessage: err.message || "Nieznany błąd podczas tworzenia kampanii",
          notes: campaignReview?.reviewNotes || ""
        };
        
        setError(errorResult.errorMessage);
        setResult(errorResult);
        
        // Przekaż informacje o błędzie do następnego kroku
        onSubmit(errorResult);
      } finally {
        setIsLoading(false);
      }
    };

    // Uruchom tworzenie kampanii automatycznie
    createCampaign();
  }, []);

  // Renderowanie stanu ładowania
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
        <h2 className="text-xl font-medium text-gray-900">{title}</h2>
        <p className="text-gray-600 text-center max-w-md">
          {description || "Trwa tworzenie kampanii reklamowej Google Ads. To może potrwać kilka chwil..."}
        </p>
      </div>
    );
  }

  // Renderowanie błędu
  if (error && !result?.success) {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <XCircle className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-medium text-red-700">Błąd tworzenia kampanii</h2>
        <div className="bg-red-50 p-4 rounded border border-red-200 text-red-800 text-sm max-w-lg">
          <p>{error}</p>
        </div>
        <button
          onClick={() => onSubmit(result)}
          className="mt-6 px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800"
        >
          Kontynuuj
        </button>
      </div>
    );
  }

  // Renderowanie sukcesu
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-4">
      <Check className="w-12 h-12 text-green-500" />
      <h2 className="text-xl font-medium text-green-700">Kampania utworzona pomyślnie</h2>
      <div className="bg-green-50 p-4 rounded border border-green-200 text-green-800 text-sm max-w-lg">
        <p>Twoja kampania reklamowa w Google Ads została utworzona pomyślnie.</p>
      </div>
      <button
        onClick={() => onSubmit(result)}
        className="mt-6 px-5 py-2.5 rounded transition-colors text-sm font-medium bg-black text-white hover:bg-gray-800"
      >
        Kontynuuj
      </button>
    </div>
  );
}