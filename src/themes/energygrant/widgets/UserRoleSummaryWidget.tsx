// src/themes/default/widgets/UserRoleSummaryWidget.tsx
import { useMemo, useEffect, useState } from 'react';
import { useParams } from "react-router-dom";
import { useAppNavigation } from "@/core/navigation";
import { useFlow } from "@/core";
import { I } from "@/components";
import { getColorClasses } from "@/themes/energygrant/utils/ColorUtils";
import { roles } from "../utils/Definitions";

type UserRoleSummaryWidgetProps = {
  role?: string;
  points?: number | string;
  successPath?: string;
  autoRedirect?: boolean;
  redirectDelay?: number;
  successLabel?: string;
  onSubmit?: () => void;
  contextDataPath?: string;
};

export default function UserRoleSummaryWidget({ 
  role = '',
  points = 0,
  successPath,
  autoRedirect = false,
  redirectDelay = 3000,
  successLabel = "Przejdź dalej",
  onSubmit,
  contextDataPath = "user-data.role"
}: UserRoleSummaryWidgetProps) {
  const params = useParams();
  const { navigateTo } = useAppNavigation();
  const { get, set } = useFlow();
  
  const [userRole, setUserRole] = useState(role);
  const [hasAnimated, setHasAnimated] = useState(false);

  const currentStep = params.stepIndex ? parseInt(params.stepIndex, 10) : 0;
  const configId = params.configId;
  const workspaceSlug = params.workspaceSlug || '';
  const scenarioSlug = params.scenarioSlug || '';

  // Inicjalizacja z kontekstu flow
  useEffect(() => {
    const contextRole = get(contextDataPath);
    if (contextRole) {
      setUserRole(contextRole);
    } else if (role) {
      setUserRole(role);
      // Zapisz rolę do kontekstu jeśli została przekazana jako prop
      set(contextDataPath, role);
    }
  }, [get, set, contextDataPath, role]);

  // Efekt animacji
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Konwersja punktów na liczbę
  const pointsNumber = useMemo(() => {
    if (typeof points === 'string') {
      const parsed = parseInt(points, 10);
      return isNaN(parsed) ? 0 : parsed;
    }
    return points || 0;
  }, [points]);

  // Funkcja do obsługi przekierowania
  const handleContinue = () => {
    if (typeof onSubmit === "function") {
      onSubmit();
    }

    const defaultPath = `/${configId}/${workspaceSlug}/${scenarioSlug}/${currentStep + 1}`;
    navigateTo(successPath, defaultPath);
  };

  // Efekt do automatycznego przekierowania
  useEffect(() => {
    let redirectTimer: number | undefined;
    
    if (autoRedirect && (successPath || (configId && workspaceSlug && scenarioSlug))) {
      redirectTimer = window.setTimeout(handleContinue, redirectDelay);
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [autoRedirect, successPath, redirectDelay, configId, workspaceSlug, scenarioSlug]);

  // Pobierz konfigurację dla bieżącej roli
  const roleConfig = useMemo(() => {
    return roles.find(r => r.id === userRole) || {
      id: 'undefined',
      name: 'Niezdefiniowana rola',
      description: 'Rola użytkownika nie została jeszcze określona',
      icon: 'user',
      features: ['Dostęp do podstawowych funkcji'],
      color: 'gray'
    };
  }, [userRole]);

  // Pobierz klasy kolorów dla wybranej roli - z uwzględnieniem animacji
  const colorClasses = useMemo(() => 
    getColorClasses(roleConfig.color, true, hasAnimated), 
    [roleConfig.color, hasAnimated]
  );

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-6 ${hasAnimated ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-4'}`} 
         style={{ transition: 'all 0.3s ease-in-out' }}>
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Twoja rola i uprawnienia</h3>
          <div className="mt-2 sm:mt-0 flex items-center">
            <I name="award" className="w-5 h-5 text-yellow-500 mr-2" />
            <span className="text-sm text-gray-600">
              Punkty startowe: <span className="font-semibold text-yellow-600">{pointsNumber}</span>
            </span>
          </div>
        </div>
        
        <div className={`rounded-lg ${colorClasses.bgClasses} border ${colorClasses.borderClasses} p-4`}>
          <div className="flex items-center mb-3">
            <div className={`w-12 h-12 rounded-full flex-shrink-0 ${colorClasses.iconContainerClasses} flex items-center justify-center mr-3`}>
              <I name={roleConfig.icon} className="w-6 h-6 stroke-2" />
            </div>
            <div>
              <h4 className="font-medium text-gray-900">{roleConfig.name}</h4>
              <p className="text-sm text-gray-600">{roleConfig.description}</p>
            </div>
          </div>
          
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            {roleConfig.features.map((feature, index) => (
              <div 
                key={index} 
                className={colorClasses.featureClasses || "flex items-center bg-white rounded px-3 py-2 border border-gray-100"}
              >
                <div className={`w-5 h-5 rounded-full ${colorClasses.iconContainerClasses} flex items-center justify-center mr-3`}>
                  <I name="check" className="w-3 h-3 stroke-2" />
                </div>
                <span className="text-sm text-gray-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Przycisk przekierowania */}
        {(successPath || (configId && workspaceSlug && scenarioSlug)) && (
          <div className="mt-6">
            <button
              onClick={handleContinue}
              className={`w-full flex items-center justify-center py-3.5 px-4 rounded-xl text-sm font-medium 
                ${colorClasses.buttonClasses} text-white shadow-md transition-all transform hover:scale-[1.01] duration-200
                focus:outline-none focus:ring-2 focus:ring-offset-2 ${colorClasses.ring}`}
            >
              {successLabel}
              <I name="arrow-right" className="w-4 h-4 ml-2 stroke-2" />
            </button>
            
            {/* Informacja o automatycznym przekierowaniu */}
            {autoRedirect && (
              <p className="text-center text-xs text-gray-500 mt-2">
                Automatyczne przekierowanie za {Math.round(redirectDelay / 1000)} sekund...
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}