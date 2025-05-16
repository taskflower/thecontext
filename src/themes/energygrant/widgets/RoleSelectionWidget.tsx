// src/themes/energygrant/widgets/RoleSelectionWidget.tsx
import React, { useState, useEffect } from "react";
import { useFlow } from "@/core";
import { I } from "@/components";

interface RoleOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  features: string[];
}

interface RoleSelectionWidgetProps {
  onChange: (role: string) => void;
  selectedRole?: string;
}

const RoleSelectionWidget: React.FC<RoleSelectionWidgetProps> = ({
  onChange,
  selectedRole = "beneficjent",
}) => {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  // Rozwijamy automatycznie wybraną rolę przy pierwszym renderze
  useEffect(() => {
    if (selectedRole && !expandedRole) {
      setExpandedRole(selectedRole);
    }
  }, []);

  const roles: RoleOption[] = [
    {
      id: "beneficjent",
      name: "Beneficjent",
      description: "Właściciel domu, który ubiega się o dotację energetyczną",
      icon: "home",
      features: [
        "Kontakt z operatorem",
        "Kalkulator zdolności do dotacji",
        "Zlecanie audytów energetycznych",
        "Zlecanie prac wykonawczych",
        "Zarządzanie zleceniami",
      ],
    },
    {
      id: "wykonawca",
      name: "Wykonawca",
      description: "Firma wykonująca prace termomodernizacyjne i energetyczne",
      icon: "tool",
      features: [
        "Dostęp do giełdy zleceń",
        "Składanie ofert na zlecenia",
        "Zarządzanie portfolio",
        "Kontakt z beneficjentami",
      ],
    },
    {
      id: "audytor",
      name: "Audytor",
      description: "Specjalista wykonujący audyty energetyczne",
      icon: "clipboard-check",
      features: [
        "Dostęp do zleceń audytów",
        "Składanie ofert na audyty",
        "Zarządzanie portfolio",
        "Kontakt z beneficjentami",
      ],
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
    },
  ];

  const { get } = useFlow();
  const darkMode = get("darkMode") === true;

  const toggleExpand = (roleId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedRole(expandedRole === roleId ? null : roleId);
  };

  const handleRoleSelect = (roleId: string) => {
    onChange(roleId);
  };

  return (
    <div className="w-full max-w-full">
      <div className="grid grid-cols-1 gap-2">
        {roles.map((role) => {
          const isExpanded = expandedRole === role.id;
          const isSelected = selectedRole === role.id;

          return (
            <div
              key={role.id}
              className={`rounded-lg border transition-all ${
                isSelected
                  ? darkMode
                    ? "border-green-600"
                    : "border-green-500"
                  : darkMode
                  ? "border-gray-700"
                  : "border-gray-200"
              } ${isExpanded ? "shadow-md" : "shadow-sm"}`}
            >
              {/* Header z przyciskiem rozwijającym po lewej i przyciskiem wyboru po prawej */}
              <div
                className={`flex items-center p-2 ${
                  isExpanded
                    ? darkMode
                      ? `bg-green-800/20 rounded-t-lg`
                      : `bg-green-50 rounded-t-lg`
                    : darkMode
                    ? "bg-gray-900"
                    : "bg-white"
                } ${isExpanded ? "rounded-b-none" : "rounded-lg"}`}
              >
                {/* Przycisk rozwijania po lewej */}
                <div className="flex-shrink-0 mr-2">
                  <button
                    onClick={(e) => toggleExpand(role.id, e)}
                    className={`flex items-center justify-center rounded-full p-1.5 transition-colors ${
                      isExpanded
                        ? darkMode
                          ? "bg-green-700 text-green-200"
                          : "bg-green-200 text-green-700"
                        : darkMode
                        ? "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-gray-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    } focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      darkMode ? "focus:ring-gray-600" : "focus:ring-gray-300"
                    }`}
                    aria-label={
                      isExpanded ? "Zwiń szczegóły" : "Rozwiń szczegóły"
                    }
                    aria-expanded={isExpanded}
                  >
                    <I
                      name={isExpanded ? "chevron-up" : "chevron-down"}
                      className="w-3.5 h-3.5"
                    />
                  </button>
                </div>

                {/* Środkowa sekcja z informacjami */}
                <div className="min-w-0 flex-1">
                
                    
                      <h3
                        className={`font-medium text-sm ${
                          darkMode ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {role.name}
                      </h3>

                      <p
                        className={`text-xs break-normal ${
                          darkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                      >
                        {role.description}
                      </p>
                   
                  
                </div>

                {/* Przycisk wyboru roli po prawej */}
                <div className="flex-shrink-0 ml-3">
                  <button
                    onClick={() => handleRoleSelect(role.id)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      isSelected
                        ? darkMode
                          ? "bg-green-600 text-white"
                          : "bg-green-500 text-white"
                        : darkMode
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    } ${
                      darkMode ? "focus:ring-green-700" : "focus:ring-green-400"
                    }`}
                    aria-label={`Wybierz rolę ${role.name}`}
                  >
                    {isSelected ? "Wybrano" : "Wybierz"}
                  </button>
                </div>
              </div>

              {/* Treść rozwinięta - z zielonym akcentem */}
              {isExpanded && (
                <div
                  className={`px-3 py-2 ${
                    darkMode ? "bg-green-900/10" : "bg-green-50/50"
                  } rounded-b-lg border-t ${
                    darkMode ? "border-green-900/20" : "border-green-100"
                  }`}
                >
                  <div
                    className={`mb-1 text-xs font-medium ${
                      darkMode ? "text-green-400" : "text-green-700"
                    }`}
                  >
                    Funkcje:
                  </div>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                    {role.features.map((feature, index) => (
                      <div
                        key={index}
                        className={`text-xs flex items-center ${
                          darkMode ? "text-gray-300" : "text-gray-600"
                        }`}
                      >
                        <div
                          className={`flex-shrink-0 mr-1.5 ${
                            darkMode ? "text-green-500" : "text-green-600"
                          }`}
                        >
                          <I name="check" className="w-3 h-3" />
                        </div>
                        <span className="truncate">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RoleSelectionWidget;
