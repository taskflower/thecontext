import { useEffect, useState } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';
import { useWidgetNavigation } from "../utils/NavigationUtils";

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
  redirectLabel = 'Przejdź do strony głównej',
  delay = 60,
  successPath,
  configId,
  workspaceSlug,
  scenarioSlug
}: RegistrationSuccessWidgetProps) {
  const [countdown, setCountdown] = useState(delay);
  const [isAnimating, setIsAnimating] = useState(true);
  
  const { handleContinue, routeParams } = useWidgetNavigation({
    successPath,
    autoRedirect: false, // We'll handle the redirection ourselves
    redirectDelay: delay * 1000,
    onSubmit: undefined
  });

  // Override config props with values from URL if not provided
  const urlConfigId = configId || routeParams.configId;
  const urlWorkspaceSlug = workspaceSlug || routeParams.workspaceSlug;
  const urlScenarioSlug = scenarioSlug || routeParams.scenarioSlug;

  // Animation and countdown effect
  useEffect(() => {
    // Animation for 2 seconds
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    // Countdown - update every 1 second
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      
      return () => {
        clearTimeout(timer);
        clearTimeout(animationTimer);
      };
    } else {
      // Redirect after countdown
      handleContinue();
    }
    
    return () => clearTimeout(animationTimer);
  }, [countdown, handleContinue]);

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
            onClick={handleContinue}
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