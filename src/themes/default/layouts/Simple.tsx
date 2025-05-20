// src/themes/default/layouts/Simple.tsx
import { X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useConfig } from "@/ConfigProvider";

interface LayoutContext {
  workspace: any;
  scenario?: any;
  stepIdx?: number;
  totalSteps?: number;
  transitioning?: boolean;
}

interface LayoutProps {
  children: React.ReactNode;
  context?: LayoutContext;
}

const SimpleLayout: React.FC<LayoutProps> = ({ children, context }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { config } = useConfig();
  const { workspace, scenario, stepIdx = 0, totalSteps = 0 } = context || {};
  
  // Sprawdź, czy jesteśmy w widoku scenariusza na podstawie ścieżki URL
  const urlParts = location.pathname.split('/');
  const isScenarioView = urlParts.length > 3; // /appName/workspaceSlug/scenarioSlug/...
  
  // Handle returning to workspace overview when X button is clicked
  const handleClose = () => {
    // Pobierz części ścieżki URL
    const parts = location.pathname.split('/');
    const appName = parts[1];
    const workspaceSlug = parts[2];
    
    // Jeśli mamy ścieżkę workspace, wróć do widoku workspace
    if (workspaceSlug) {
      navigate(`/${appName}/${workspaceSlug}`);
    } else if (config?.defaultWorkspace) {
      // Jeśli bieżący workspace nie jest dostępny, użyj domyślnego z konfiguracji
      navigate(`/${config.name || ''}/${config.defaultWorkspace}`);
    } else {
      // Jeśli nie ma żadnego workspace'a, przejdź do strony głównej
      navigate('/');
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pt-6">
      <div className="overflow-hidden flex flex-col bg-white rounded border border-gray-200 shadow-sm w-full max-w-4xl mx-auto h-full md:min-h-[95vh] md:max-h-[95vh]">
        <div className="px-5 py-5 bg-white border-b border-gray-100">
          <div className="w-full flex items-center justify-between">
            <div className="font-bold text-lg tracking-tight text-gray-900">
              {workspace?.name || config?.name || 'FlowApp'}
            </div>
            
            {/* Przycisk X - widoczny tylko w widoku scenariusza */}
            {isScenarioView && (
              <button 
                onClick={handleClose}
                className="inline-flex items-center justify-center text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 h-8 w-8 rounded-md text-gray-600 hover:bg-gray-100"
                title="Wróć do obszaru roboczego"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          {isScenarioView && (
            <>
              <div className="mt-8 mb-6">
                <h2 className="text-2xl font-normal text-gray-900">
                  {workspace?.name}<br />
                  <span className="font-semibold">{scenario?.name}</span>
                </h2>
              </div>
              <div className="mb-3">
                <h3 className="font-semibold text-sm text-gray-900">
                  Krok {stepIdx + 1}: {scenario?.nodes?.[stepIdx]?.label || ''}
                </h3>
              </div>
              
              <div className="mb-4">
                <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-300"
                    style={{ width: `${((stepIdx + 1) / totalSteps) * 100}%` }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto">
          <div className="p-5">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleLayout;