import { useState, useEffect } from "react";
import {
  User,
  Wrench,
  ClipboardCheck,
  Headphones,
  Check,
  ArrowRight,
} from "lucide-react";
import { useFlow } from "@/core"; // Import useFlow from your core module
import { useAppNavigation } from "@/core/navigation";
import { useParams } from "react-router-dom";
import { useConfig } from "@/ConfigProvider"; // Dodajemy import dla useConfig

type Role = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
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
  contextDataPath = "user-data.role", // Ustawienie domyślnej ścieżki na "user-data.role"
  showDetailedView = true,
  workspaceSlug,
  scenarioSlug,
  successPath,
  successLabel = "Przejdź dalej",
}: InteractiveRoleSelectorWidgetProps) {
  const { get, set } = useFlow();
  const { navigateTo, toScenarioStep } = useAppNavigation(); // Dodajemy toScenarioStep
  const params = useParams();
  const { configId } = useConfig(); // Pobieramy configId bezpośrednio z useConfig
  const [selectedRole, setSelectedRole] = useState("");
  const [hasAnimated, setHasAnimated] = useState(false);

  // Get currentStep from URL params or set to 0
  const currentStep = params.stepIndex ? parseInt(params.stepIndex, 10) : 0;
  const urlConfigId = params.configId || configId || "default";

  // Użyj workspaceSlug z parametrów URL jeśli nie jest przekazany jako prop
  const urlWorkspaceSlug = params.workspaceSlug || workspaceSlug;
  const urlScenarioSlug = params.scenarioSlug || scenarioSlug;

  // Initialize from flow context
  useEffect(() => {
    // Pobierz dane z kontekstu - zgodnie z contextDataPath
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
      // Zapisz ID roli w kontekście pod ścieżką contextDataPath
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
      icon: <User className="w-6 h-6" />,
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
      icon: <Wrench className="w-6 h-6" />,
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
      icon: <ClipboardCheck className="w-6 h-6" />,
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
      icon: <Headphones className="w-6 h-6" />,
      features: [
        "Weryfikacja wniosków",
        "Moderacja zleceń",
        "Wsparcie beneficjentów",
        "Chat z uczestnikami programu",
      ],
      color: "green",
    },
  ];

  // CSS color classes (enhanced for better visual impact)
  const getColorClasses = (color: string, isSelected: boolean) => {
    const baseClasses = {
      blue: {
        icon: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
        hover: "hover:border-blue-300 hover:bg-blue-50",
        selected: "border-blue-500 bg-blue-50/70",
        button: "bg-blue-600 hover:bg-blue-700",
        gradient: "from-blue-500 to-blue-600",
        ring: "ring-blue-500/20",
      },
      orange: {
        icon: "text-orange-600",
        bg: "bg-orange-50",
        border: "border-orange-200",
        hover: "hover:border-orange-300 hover:bg-orange-50",
        selected: "border-orange-500 bg-orange-50/70",
        button: "bg-orange-600 hover:bg-orange-700",
        gradient: "from-orange-500 to-orange-600",
        ring: "ring-orange-500/20",
      },
      indigo: {
        icon: "text-indigo-600",
        bg: "bg-indigo-50",
        border: "border-indigo-200",
        hover: "hover:border-indigo-300 hover:bg-indigo-50",
        selected: "border-indigo-500 bg-indigo-50/70",
        button: "bg-indigo-600 hover:bg-indigo-700",
        gradient: "from-indigo-500 to-indigo-600",
        ring: "ring-indigo-500/20",
      },
      green: {
        icon: "text-green-600",
        bg: "bg-green-50",
        border: "border-green-200",
        hover: "hover:border-green-300 hover:bg-green-50",
        selected: "border-green-500 bg-green-50/70",
        button: "bg-green-600 hover:bg-green-700",
        gradient: "from-green-500 to-green-600",
        ring: "ring-green-500/20",
      },
    };

    const classes = baseClasses[color as keyof typeof baseClasses] || {
      icon: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      hover: "hover:border-gray-300 hover:bg-gray-50",
      selected: "border-gray-500 bg-gray-50/70",
      button: "bg-gray-600 hover:bg-gray-700",
      gradient: "from-gray-500 to-gray-600",
      ring: "ring-gray-500/20",
    };

    return {
      cardClasses: `border rounded-xl overflow-hidden transition-all ${
        isSelected
          ? `${classes.selected} shadow-lg ring-1 ${classes.ring}`
          : `${classes.border} ${classes.hover} shadow-sm`
      } ${
        hasAnimated
          ? "opacity-100 transform translate-y-0"
          : "opacity-0 transform translate-y-4"
      }`,
      iconClasses: `${classes.icon} ${isSelected ? "bg-white" : classes.bg}`,
      iconContainerClasses: `${
        isSelected
          ? `bg-gradient-to-br ${classes.gradient} text-white shadow-md`
          : `bg-white ${classes.border}`
      }`,
      bgClasses: isSelected ? classes.bg : "",
      borderClasses: `${classes.border}`,
      buttonClasses: `bg-gradient-to-br ${classes.gradient} shadow-md`,
      featureClasses: `py-2 px-3 bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow transition-shadow`,
      ring: classes.ring,
    };
  };

  // Handle role selection
  const handleRoleSelect = (roleId: string) => {
    setSelectedRole(roleId);
  };

  // Handle navigation to next step - ZMODYFIKOWANA FUNKCJA
  const handleContinue = () => {
    // Sprawdź czy mamy wszystkie potrzebne dane
    if (!urlWorkspaceSlug || !urlScenarioSlug) {
      console.error("Brak wymaganych parametrów workspaceSlug lub scenarioSlug");
      return; // Przerwij jeśli brakuje kluczowych danych
    }

    try {
      if (successPath) {
        // Jeśli mamy zdefiniowaną własną ścieżkę, użyj jej
        navigateTo(successPath);
      } else {
        // W przeciwnym razie użyj toScenarioStep
        const nextStep = currentStep + 1;
        console.log(`Przechodzę do kroku ${nextStep} scenariusza ${urlScenarioSlug} w workspace ${urlWorkspaceSlug}`);
        
        // Możesz użyć toScenarioStep lub navigateTo - wybierz to, co działa lepiej
        toScenarioStep(urlWorkspaceSlug, urlScenarioSlug, nextStep);
        
        // Alternatywnie:
        // const fullPath = `/${urlConfigId}/${urlWorkspaceSlug}/${urlScenarioSlug}/${nextStep}`;
        // navigateTo(fullPath);
      }
    } catch (error) {
      console.error("Błąd podczas nawigacji:", error);
    }
  };

  return (
    <div className="space-y-4 max-w-3xl mx-auto">
      {roles.map((role, index) => {
        const isSelected = selectedRole === role.id;
        const colorClasses = getColorClasses(role.color, isSelected);

        // Delay animation for each card by 100ms * index
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
                  className={`w-12 h-12 rounded-full ${colorClasses.iconContainerClasses} flex items-center justify-center`}
                >
                  {role.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg tracking-tight">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-0.5">
                    {role.description}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                {isSelected ? (
                  <div className="flex items-center text-green-600 bg-green-50 py-1 px-2.5 rounded-full">
                    <Check className="w-4 h-4 mr-1" />
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
                          className={`w-5 h-5 rounded-full ${colorClasses.iconContainerClasses} flex items-center justify-center mr-3`}
                        >
                          <Check className="w-3 h-3" />
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
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
      <button
        type="button"
        className={`mt-6 flex items-center justify-center w-full px-4 py-3.5 border border-transparent rounded-xl shadow-md text-sm font-medium text-white ${
          selectedRole
            ? getColorClasses(
                roles.find((r) => r.id === selectedRole)?.color || "blue",
                true
              ).buttonClasses
            : "bg-gray-300 cursor-not-allowed opacity-60"
        } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
          selectedRole
            ? getColorClasses(
                roles.find((r) => r.id === selectedRole)?.color || "blue",
                true
              ).ring
            : "ring-gray-300/20"
        } transition-all transform ${selectedRole ? "hover:scale-[1.01]" : ""}`}
        onClick={handleContinue}
        disabled={!selectedRole}
      >
        {successLabel} <ArrowRight className="ml-2 w-4 h-4" />
      </button>
    </div>
  );
}