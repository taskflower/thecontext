import { useState, useEffect } from "react";
import { I } from "@/components";
import { useFlow } from "@/core"; 
import { useAppNavigation } from "@/core/navigation";
import { useParams } from "react-router-dom";
import { getColorClasses } from "@/themes/energygrant/utils/ColorUtils";

type Role = {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
  color: string;
};

type InteractiveRoleSelectorWidgetProps = {
  selectedRoleId?: string;
  contextDataPath?: string;
  showDetailedView?: boolean;
  workspaceSlug?: string;
  scenarioSlug?: string;
  successPath?: string;
  successLabel?: string;
};

export default function InteractiveRoleSelectorWidget({
  selectedRoleId = "",
  contextDataPath = "user-data.role",
  showDetailedView = true,
  workspaceSlug,
  scenarioSlug,
  successPath,
  successLabel = "Przejdź dalej",
}: InteractiveRoleSelectorWidgetProps) {
  const { get, set } = useFlow();
  const { navigateTo, toScenarioStep } = useAppNavigation();
  const params = useParams();
  const [selectedRole, setSelectedRole] = useState("");
  const [hasAnimated, setHasAnimated] = useState(false);

  const currentStep = params.stepIndex ? parseInt(params.stepIndex, 10) : 0;
  const urlWorkspaceSlug = params.workspaceSlug || workspaceSlug;
  const urlScenarioSlug = params.scenarioSlug || scenarioSlug;

  // Initialize from flow context
  useEffect(() => {
    const contextRole = get(contextDataPath);
    if (contextRole) {
      setSelectedRole(contextRole);
    } else if (selectedRoleId) {
      setSelectedRole(selectedRoleId);
    }
  }, [get, contextDataPath, selectedRoleId]);

  // Update flow context when selection changes
  useEffect(() => {
    if (selectedRole) {
      set(contextDataPath, selectedRole);
    }
  }, [selectedRole, set, contextDataPath]);

  // Entry animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Role definitions
  const roles: Role[] = [
    {
      id: "beneficiary",
      name: "Beneficjent",
      description: "Właściciel domu, który ubiega się o dotację energetyczną",
      icon: "house",
      features: [
        "Kontakt z operatorem",
        "Kalkulator zdolności do dotacji",
        "Zlecanie audytów energetycznych",
        "Zlecanie prac wykonawczych",
        "Zarządzanie zleceniami",
      ],
      color: "blue",
    },
    {
      id: "contractor",
      name: "Wykonawca",
      description: "Firma wykonująca prace termomodernizacyjne i energetyczne",
      icon: "wrench",
      features: [
        "Dostęp do giełdy zleceń",
        "Składanie ofert na zlecenia",
        "Zarządzanie portfolio",
        "Kontakt z beneficjentami",
      ],
      color: "orange",
    },
    {
      id: "auditor",
      name: "Audytor",
      description: "Specjalista wykonujący audyty energetyczne",
      icon: "square-check-big",
      features: [
        "Dostęp do zleceń audytów",
        "Składanie ofert na audyty",
        "Zarządzanie portfolio",
        "Kontakt z beneficjentami",
      ],
      color: "indigo",
    },
    {
      id: "operator",
      name: "Operator",
      description: "Administrator programu dotacji energetycznych",
      icon: "settings",
      features: [
        "Weryfikacja wniosków",
        "Moderacja zleceń",
        "Wsparcie beneficjentów",
        "Chat z uczestnikami programu",
      ],
      color: "green",
    },
  ];

  // Handle role selection
  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  // Handle continue button click
  const handleContinue = () => {
    if (!urlWorkspaceSlug || !urlScenarioSlug) {
      console.error("Brak wymaganych parametrów workspaceSlug lub scenarioSlug");
      return; 
    }
    
    try {
      if (successPath) {
        navigateTo(successPath);
      } else {
        const nextStep = currentStep + 1;
        toScenarioStep(urlWorkspaceSlug, urlScenarioSlug, nextStep);
      }
    } catch (error) {
      console.error("Błąd podczas nawigacji:", error);
    }
  };

  // Get selected role object
  const getSelectedRoleObject = () => roles.find(r => r.id === selectedRole);

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {roles.map((role, index) => {
        const isSelected = selectedRole === role.id;
        const colorClasses = getColorClasses(role.color, isSelected, hasAnimated);
        const animationDelay = index * 100;

        return (
          <div
            key={role.id}
            className={colorClasses.cardClasses}
            style={{ transitionDelay: `${animationDelay}ms` }}
          >
            {/* Card header */}
            <div
              className={`p-5 flex items-center justify-between cursor-pointer ${colorClasses.bgClasses}`}
              onClick={() => handleRoleSelect(role.id)}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex-shrink-0 ${colorClasses.iconContainerClasses} flex items-center justify-center`}
                >
                  <I name={role.icon} className="w-6 h-6 stroke-2" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg tracking-tight truncate">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                    {role.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {isSelected ? (
                  <div className="flex items-center text-green-600 bg-green-50 py-1 px-2.5 rounded-full">
                    <I name="check" className="w-4 h-4 mr-1 stroke-2" />
                    <span className="text-xs font-medium">Wybrano</span>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-gray-200"></div>
                )}
              </div>
            </div>

            {/* Role details (automatically expanded when selected) */}
            {isSelected && showDetailedView && (
              <div
                className={`p-5 border-t ${colorClasses.borderClasses} bg-white/50 backdrop-blur-sm`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {role.features.map((feature, idx) => (
                    <div key={idx} className={colorClasses.featureClasses}>
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 rounded-full flex-shrink-0 ${colorClasses.iconContainerClasses} flex items-center justify-center mr-3`}
                        >
                          <I name="check" className="w-3 h-3 stroke-2" />
                        </div>
                        <span className="text-sm text-gray-700 truncate">{feature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Continue button - only show enabled when role selected */}
      {selectedRole && (
        <button
          type="button"
          className={`mt-6 flex items-center justify-center w-full px-4 py-3.5 border border-transparent rounded-xl shadow-md text-sm font-medium text-white ${
            getColorClasses(getSelectedRoleObject()?.color || "blue", true).buttonClasses
          } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
            getColorClasses(getSelectedRoleObject()?.color || "blue", true).ring
          } transition-all transform hover:scale-[1.01]`}
          onClick={handleContinue}
        >
          {successLabel} <I name="arrow-right" className="ml-2 w-4 h-4 stroke-2" />
        </button>
      )}
      
      {!selectedRole && (
        <button
          type="button"
          className="mt-6 flex items-center justify-center w-full px-4 py-3.5 border border-transparent rounded-xl shadow-md text-sm font-medium text-white bg-gray-300 cursor-not-allowed opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-gray-300/20"
          disabled
        >
          {successLabel} <I name="arrow-right" className="ml-2 w-4 h-4" />
        </button>
      )}
    </div>
  );
}