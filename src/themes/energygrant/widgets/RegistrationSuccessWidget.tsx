import { useEffect, useState } from 'react';
import { CheckCircle, ChevronRight } from 'lucide-react';

type RegistrationSuccessWidgetProps = {
  userName?: string;
  redirectUrl?: string;
  redirectLabel?: string;
  delay?: number;
};

export default function RegistrationSuccessWidget({ 
  userName = 'Użytkowniku',
  redirectUrl = '/dashboard',
  redirectLabel = 'Przejdź do strony głównej',
  delay = 60
}: RegistrationSuccessWidgetProps) {
  const [countdown, setCountdown] = useState(delay);
  const [isAnimating, setIsAnimating] = useState(true);

  // Efekt animacji i odliczania
  useEffect(() => {
    // Animacja przez 2 sekundy
    const animationTimer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);

    // Odliczanie - aktualizacja co 1 sekundę zamiast co 1 minutę
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => prev - 1);
      }, 1000); // Zmieniono z 60000 (1 minuta) na 1000 (1 sekunda)
      
      return () => {
        clearTimeout(timer);
        clearTimeout(animationTimer);
      };
    } else {
      // Przekierowanie po zakończeniu odliczania
      window.location.href = redirectUrl;
    }
    
    return () => clearTimeout(animationTimer);
  }, [countdown, redirectUrl]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
      <div className="p-8 text-center">
        <div className={`mx-auto w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-6 ${
          isAnimating ? 'animate-pulse' : ''
        }`}>
          <CheckCircle className="w-10 h-10 text-green-500" />
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
              className="bg-green-500 h-2 rounded-full transition-all duration-1000 ease-in-out"
              style={{ width: `${(delay - countdown) / delay * 100}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500 mb-6">
            Automatyczne przekierowanie za <span className="font-semibold">{countdown}</span> sekund
          </div>
          
          <a
            href={redirectUrl}
            className="inline-flex items-center justify-center w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            {redirectLabel}
            <ChevronRight className="ml-2 w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}