import { useEffect, useState } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useAppNavigation } from "@/core/navigation";
import { useParams } from "react-router-dom";

type RegistrationSuccessWidgetProps = {
  userName?: string;
  redirectUrl?: string;
  redirectLabel?: string;
  delay?: number;
  successPath?: string;
  configId?: string;
  workspaceSlug?: string;
  scenarioSlug?: string;
};

export default function RegistrationSuccessWidget({ 
  userName = 'Użytkowniku',
  redirectUrl = '/dashboard',
  redirectLabel = 'Przejdź do strony głównej',
  delay = 60,
  successPath,
  configId,
  workspaceSlug,
  scenarioSlug
}: RegistrationSuccessWidgetProps) {
  const [countdown, setCountdown] = useState(delay);
  const [isAnimating, setIsAnimating] = useState(true);
  const { navigateTo } = useAppNavigation();
  const params = useParams();

  // Pobierz parametry z URL jeśli nie podano jako propsy
  const urlConfigId = configId || params.configId;
  const urlWorkspaceSlug = workspaceSlug || params.workspaceSlug || '';
  const urlScenarioSlug = scenarioSlug || params.scenarioSlug || '';
  const currentStep = params.stepIndex ? parseInt(params.stepIndex, 10) : 0;

  // Funkcja obsługi przekierowania
  const handleRedirect = () => {
    if (successPath) {
      navigateTo(successPath);
    } else if (urlConfigId && urlWorkspaceSlug && urlScenarioSlug) {
      const defaultPath = `/${urlConfigId}/${urlWorkspaceSlug}/${urlScenarioSlug}/${currentStep + 1}`;
      navigateTo(defaultPath);
    } else {
      window.location.href = redirectUrl;
    }
  };

  // Efekt animacji i odliczania
  useEffect(() => {
    // Animacja przez 2 sekundy
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    // Odliczanie - aktualizacja co 1 sekundę
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(animationTimer);
      };
    } else {
      // Przekierowanie po zakończeniu odliczania
      handleRedirect();
    }
    
    return () => clearTimeout(animationTimer);
  }, [countdown, redirectUrl]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 transition-all duration-300 transform opacity-100 translate-y-0" 
         style={{ animation: "fadeInUp 0.5s ease-out" }}>
      <div className="p-8 text-center">
        <div className={`mx-auto w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 ${
          isAnimating ? 'animate-pulse' : ''
        }`}>
          <CheckCircle className="w-10 h-10 text-emerald-500" />
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Rejestracja zakończona!
        </h3>
        
        <p className="text-gray-600 mb-6">
          Gratulacje, {userName}! Twoje konto zostało pomyślnie utworzone. 
          Za chwilę zostaniesz przekierowany na stronę główną.
        </p>
        
        <div className="max-w-xs mx-auto">
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-green-500 h-2 rounded-full transition-all duration-1000 ease-in-out"
              style={{ width: `${(delay - countdown) / delay * 100}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500 mb-6">
            Automatyczne przekierowanie za <span className="font-semibold">{countdown}</span> sekund
          </div>
          
          <button
            onClick={handleRedirect}
            className="inline-flex items-center justify-center w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            {redirectLabel}
            <ChevronRight className="ml-2 w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}